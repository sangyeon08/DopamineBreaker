from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager

# Flask 확장 초기화
bcrypt = Bcrypt()
jwt = JWTManager()
