from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from functools import wraps

def get_current_user_id(optional=True):
    """
    현재 요청의 JWT에서 사용자 ID를 추출

    Args:
        optional (bool): True인 경우 JWT가 없어도 None 반환, False인 경우 오류 발생

    Returns:
        int or None: 사용자 ID 또는 None
    """
    try:
        verify_jwt_in_request(optional=optional)
        identity = get_jwt_identity()
        if identity:
            return int(identity)
        return None
    except Exception:
        if optional:
            return None
        raise


def jwt_optional(f):
    """
    JWT 인증을 선택적으로 적용하는 데코레이터
    JWT가 있으면 검증하고, 없으면 user_id=None으로 진행
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = get_current_user_id(optional=True)
        return f(*args, user_id=user_id, **kwargs)
    return decorated_function
