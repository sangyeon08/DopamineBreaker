from flask import jsonify
from functools import wraps
from database import db


def handle_db_errors(f):
    """
    데이터베이스 작업의 에러를 처리하는 데코레이터
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    return decorated_function


def validate_json_payload(required_fields):
    """
    JSON 요청 페이로드의 필수 필드를 검증하는 데코레이터

    Args:
        required_fields (list): 필수 필드 목록

    Usage:
        @validate_json_payload(['username', 'password'])
        def login():
            ...
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            from flask import request
            data = request.get_json()

            if not data:
                return jsonify({'message': '요청 데이터가 없습니다.'}), 400

            missing_fields = [field for field in required_fields if field not in data]
            if missing_fields:
                return jsonify({
                    'message': f'필수 필드가 누락되었습니다: {", ".join(missing_fields)}'
                }), 400

            return f(*args, **kwargs)
        return decorated_function
    return decorator


def success_response(data=None, message=None, status=200):
    """
    성공 응답을 생성하는 헬퍼 함수

    Args:
        data: 응답 데이터
        message: 성공 메시지
        status: HTTP 상태 코드

    Returns:
        Flask response
    """
    response = {}
    if message:
        response['message'] = message
    if data is not None:
        if isinstance(data, dict):
            response.update(data)
        else:
            response['data'] = data
    return jsonify(response), status


def error_response(message, status=400):
    """
    에러 응답을 생성하는 헬퍼 함수

    Args:
        message: 에러 메시지
        status: HTTP 상태 코드

    Returns:
        Flask response
    """
    return jsonify({'error': message}), status
