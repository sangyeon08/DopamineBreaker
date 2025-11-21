from flask import Flask, request
from flask_cors import CORS
from config import DevelopmentConfig
from database import db
from extensions import bcrypt, jwt
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
import atexit

def create_app(config_class=DevelopmentConfig):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        app.logger.warning(f'토큰 만료: {jwt_payload}')
        return {'message': '토큰이 만료되었습니다.'}, 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        app.logger.warning(f'유효하지 않은 토큰: {error}')
        return {'message': '유효하지 않은 토큰입니다.'}, 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        app.logger.warning(f'토큰 누락: {error}')
        return {'message': '인증 토큰이 필요합니다.'}, 401

    cors_origins = app.config.get('CORS_ORIGINS') or '*'
    CORS(app, resources={r"/api/*": {"origins": cors_origins}}, supports_credentials=True)

    @app.after_request
    def apply_custom_cors(response):
        origin = request.headers.get('Origin')
        allow_all = cors_origins == '*' or cors_origins == ['*']

        if origin and (allow_all or origin in cors_origins):
            response.headers['Access-Control-Allow-Origin'] = origin
            response.headers.setdefault('Vary', 'Origin')
        elif allow_all:
            response.headers['Access-Control-Allow-Origin'] = '*'

        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response.headers['Access-Control-Max-Age'] = '3600'
        return response
    from routes.missions import missions_bp
    from routes.auth import auth_bp

    app.register_blueprint(missions_bp, url_prefix='/api/missions')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')

    @app.route('/')
    def index():
        return {'message': '도파민 브레이커 API 서버입니다.', 'status': 'running'}

    @app.route('/health')
    def health():
        return {'status': 'healthy'}

    scheduler = BackgroundScheduler()

    def scheduled_mission_generation():
        with app.app_context():
            from services.ai_mission_generator import generate_and_save_daily_missions
            generate_and_save_daily_missions()

    scheduler.add_job(
        func=scheduled_mission_generation,
        trigger=CronTrigger(hour=0, minute=1),
        id='daily_mission_generation',
        name='Generate daily missions at midnight',
        replace_existing=True
    )

    scheduler.start()
    atexit.register(lambda: scheduler.shutdown())

    return app

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        db.create_all()

        from services.ai_mission_generator import generate_and_save_daily_missions
        from models.daily_mission import DailyMission
        from datetime import datetime

        today = datetime.now().date()
        existing_mission = DailyMission.query.filter_by(date=today).first()
        if not existing_mission:
            app.logger.info("오늘 미션이 없습니다. 즉시 생성합니다.")
            generate_and_save_daily_missions()

    app.run(debug=True, host='0.0.0.0', port=5001)
