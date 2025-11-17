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

    # Initialize extensions
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

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

    # Register blueprints
    from routes.screen_time import screen_time_bp
    from routes.missions import missions_bp
    from routes.statistics import statistics_bp
    from routes.achievements import achievements_bp
    from routes.auth import auth_bp

    app.register_blueprint(screen_time_bp, url_prefix='/api/screen-time')
    app.register_blueprint(missions_bp, url_prefix='/api/missions')
    app.register_blueprint(statistics_bp, url_prefix='/api/statistics')
    app.register_blueprint(achievements_bp, url_prefix='/api/achievements')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')

    @app.route('/')
    def index():
        return {'message': '도파민 브레이커 API 서버입니다.', 'status': 'running'}

    @app.route('/health')
    def health():
        return {'status': 'healthy'}

    # 스케줄러 설정 (매일 자정에 AI 미션 생성)
    scheduler = BackgroundScheduler()

    def scheduled_mission_generation():
        """스케줄된 미션 생성 작업"""
        with app.app_context():
            from services.ai_mission_generator import generate_and_save_daily_missions
            generate_and_save_daily_missions()

    # 매일 오전 0시 1분에 새로운 미션 생성
    scheduler.add_job(
        func=scheduled_mission_generation,
        trigger=CronTrigger(hour=0, minute=1),
        id='daily_mission_generation',
        name='Generate daily missions at midnight',
        replace_existing=True
    )

    scheduler.start()

    # 앱 종료 시 스케줄러도 종료
    atexit.register(lambda: scheduler.shutdown())

    return app

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        db.create_all()  # 데이터베이스 테이블 생성

        # 앱 시작 시 오늘 미션이 없으면 즉시 생성
        from services.ai_mission_generator import generate_and_save_daily_missions
        from models.daily_mission import DailyMission
        from datetime import datetime

        today = datetime.now().date()
        existing_mission = DailyMission.query.filter_by(date=today).first()
        if not existing_mission:
            app.logger.info("오늘 미션이 없습니다. 즉시 생성합니다.")
            generate_and_save_daily_missions()

    app.run(debug=True, host='0.0.0.0', port=5001)
