from flask import request, jsonify, Blueprint
from models.user import UserModel
from database import db
from app import bcrypt  # app.py에서 생성한 bcrypt 객체 가져오기
from flask_jwt_extended import create_access_token
import datetime

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """사용자 회원가입"""
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({'message': 'Username, email, and password are required'}), 400

    if UserModel.query.filter_by(username=username).first():
        return jsonify({'message': 'Username already exists'}), 409
    
    if UserModel.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already exists'}), 409

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    
    new_user = UserModel(username=username, email=email, password_hash=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User created successfully'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    """사용자 로그인 및 JWT 토큰 발급"""
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Username and password are required'}), 400

    user = UserModel.query.filter_by(username=username).first()

    if user and bcrypt.check_password_hash(user.password_hash, password):
        # 토큰 유효기간 설정 (예: 1일)
        expires = datetime.timedelta(days=1)
        access_token = create_access_token(identity=user.id, expires_delta=expires)
        return jsonify(access_token=access_token), 200
    
    return jsonify({'message': 'Invalid credentials'}), 401
