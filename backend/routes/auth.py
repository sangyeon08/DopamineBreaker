from flask import request, jsonify, Blueprint, current_app
from models.user import UserModel
from database import db
from extensions import bcrypt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import datetime

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()

        if not data:
            current_app.logger.error('회원가입 요청에 데이터가 없습니다.')
            return jsonify({'message': '요청 데이터가 없습니다.'}), 400

        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        current_app.logger.info(f'회원가입 시도: username={username}, email={email}')

        if not username or not email or not password:
            current_app.logger.warning('필수 필드가 누락되었습니다.')
            return jsonify({'message': '사용자명, 이메일, 비밀번호는 필수입니다.'}), 400

        if UserModel.query.filter_by(username=username).first():
            current_app.logger.warning(f'중복된 사용자명: {username}')
            return jsonify({'message': '이미 존재하는 사용자명입니다.'}), 409

        if UserModel.query.filter_by(email=email).first():
            current_app.logger.warning(f'중복된 이메일: {email}')
            return jsonify({'message': '이미 존재하는 이메일입니다.'}), 409

        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

        new_user = UserModel(username=username, email=email, password_hash=hashed_password)
        db.session.add(new_user)
        db.session.commit()

        current_app.logger.info(f'회원가입 성공: user_id={new_user.id}, username={username}')
        return jsonify({'message': '회원가입이 완료되었습니다.'}), 201

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'회원가입 중 오류 발생: {str(e)}', exc_info=True)
        return jsonify({'message': '회원가입 중 오류가 발생했습니다.', 'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()

        if not data:
            current_app.logger.error('로그인 요청에 데이터가 없습니다.')
            return jsonify({'message': '요청 데이터가 없습니다.'}), 400

        username = data.get('username')
        password = data.get('password')

        current_app.logger.info(f'로그인 시도: username={username}')

        if not username or not password:
            current_app.logger.warning('사용자명 또는 비밀번호가 누락되었습니다.')
            return jsonify({'message': '사용자명과 비밀번호는 필수입니다.'}), 400

        user = UserModel.query.filter_by(username=username).first()

        if user and bcrypt.check_password_hash(user.password_hash, password):
            expires = datetime.timedelta(days=1)
            access_token = create_access_token(identity=str(user.id), expires_delta=expires)
            current_app.logger.info(f'로그인 성공: user_id={user.id}, username={username}')
            return jsonify(access_token=access_token), 200

        current_app.logger.warning(f'로그인 실패: username={username}')
        return jsonify({'message': '사용자명 또는 비밀번호가 올바르지 않습니다.'}), 401

    except Exception as e:
        current_app.logger.error(f'로그인 중 오류 발생: {str(e)}', exc_info=True)
        return jsonify({'message': '로그인 중 오류가 발생했습니다.', 'error': str(e)}), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        current_app.logger.info('사용자 정보 조회 엔드포인트 호출됨')
        user_id = get_jwt_identity()
        current_app.logger.info(f'JWT에서 추출한 user_id: {user_id}')
        user = UserModel.query.get(int(user_id))

        if not user:
            current_app.logger.warning(f'사용자를 찾을 수 없음: user_id={user_id}')
            return jsonify({'message': '사용자를 찾을 수 없습니다.'}), 404

        current_app.logger.info(f'사용자 정보 조회: user_id={user_id}, username={user.username}')
        return jsonify({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'created_at': user.created_at.isoformat() if user.created_at else None
        }), 200

    except Exception as e:
        current_app.logger.error(f'사용자 정보 조회 중 오류 발생: {str(e)}', exc_info=True)
        return jsonify({'message': '사용자 정보 조회 중 오류가 발생했습니다.', 'error': str(e)}), 500
