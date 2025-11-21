from flask import Blueprint, request, jsonify
from datetime import datetime
from database import db
from models.mission import Mission, MissionRecord
from models.daily_mission import DailyMission
from utils.auth_helpers import get_current_user_id
from utils.error_handlers import handle_db_errors, validate_json_payload, success_response

missions_bp = Blueprint('missions', __name__)

@missions_bp.route('', methods=['GET'])
def get_all_missions():
    missions = Mission.query.all()
    return jsonify([mission.to_dict() for mission in missions]), 200


@missions_bp.route('/presets', methods=['GET'])
def get_mission_presets_list():
    today = datetime.now().date()
    daily_mission = DailyMission.query.filter_by(date=today).first()

    if not daily_mission:
        return jsonify({'error': '오늘의 미션이 아직 생성되지 않았습니다.'}), 404

    all_presets = daily_mission.to_mission_list()

    # 오늘 완료한 프리셋 미션 목록을 조회하여 중복 수행 방지
    today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    completed_today = db.session.query(MissionRecord).filter(
        MissionRecord.preset_mission_id.isnot(None),
        MissionRecord.completed_at >= today_start
    ).all()

    completed_ids = {record.preset_mission_id for record in completed_today}
    available_presets = [m for m in all_presets if m['id'] not in completed_ids]

    return jsonify({'missions': available_presets}), 200

@missions_bp.route('/<int:mission_id>', methods=['GET'])
def get_mission(mission_id):
    mission = Mission.query.get_or_404(mission_id)
    return jsonify(mission.to_dict()), 200

@missions_bp.route('/<int:mission_id>/start', methods=['POST'])
def start_mission(mission_id):
    mission = Mission.query.get_or_404(mission_id)
    return jsonify({
        'mission': mission.to_dict(),
        'started_at': datetime.now().isoformat()
    }), 200

@missions_bp.route('/<int:mission_id>/complete', methods=['POST'])
def complete_mission(mission_id):
    mission = Mission.query.get_or_404(mission_id)
    data = request.get_json() or {}

    record = MissionRecord(
        mission_id=mission_id,
        actual_duration=data.get('actual_duration', mission.duration),
        notes=data.get('notes')
    )

    try:
        db.session.add(record)
        db.session.commit()
        return jsonify(record.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@missions_bp.route('/records', methods=['GET'])
def get_mission_records():
    limit = request.args.get('limit', 10, type=int)
    offset = request.args.get('offset', 0, type=int)

    records = MissionRecord.query\
        .order_by(MissionRecord.completed_at.desc())\
        .limit(limit)\
        .offset(offset)\
        .all()

    total = MissionRecord.query.count()

    return jsonify({
        'records': [record.to_dict() for record in records],
        'total': total,
        'limit': limit,
        'offset': offset
    }), 200

@missions_bp.route('/presets/complete', methods=['POST'])
@validate_json_payload(['preset_mission_id'])
@handle_db_errors
def complete_preset_mission():
    data = request.get_json()
    user_id = get_current_user_id()

    record = MissionRecord(
        user_id=user_id,
        preset_mission_id=data['preset_mission_id'],
        tier=data.get('tier'),
        title=data.get('title'),
        description=data.get('description'),
        actual_duration=data.get('duration'),
        notes=data.get('notes')
    )

    db.session.add(record)
    db.session.commit()
    return success_response(record.to_dict(), status=201)


@missions_bp.route('/presets/fail', methods=['POST'])
@validate_json_payload(['preset_mission_id'])
@handle_db_errors
def fail_preset_mission():
    """미션 실패/취소 기록"""
    data = request.get_json()
    user_id = get_current_user_id()

    # actual_duration=0, notes='failed'로 실패 기록 (완료한 미션과 구분)
    record = MissionRecord(
        user_id=user_id,
        preset_mission_id=data['preset_mission_id'],
        tier=data.get('tier'),
        title=data.get('title'),
        description=data.get('description'),
        actual_duration=0,
        notes='failed'
    )

    db.session.add(record)
    db.session.commit()
    return success_response(
        {'record': record.to_dict()},
        message='Mission failed recorded',
        status=201
    )


@missions_bp.route('/medals', methods=['GET'])
def get_earned_medals():
    user_id = get_current_user_id()

    # 티어가 있고 실제 완료한 미션만 필터링 (실패 기록 제외)
    query = MissionRecord.query.filter(
        MissionRecord.tier.isnot(None),
        MissionRecord.actual_duration > 0
    )

    if user_id:
        # 로그인 전 완료한 미션(user_id=None) + 로그인 후 본인 미션만 조회
        query = query.filter((MissionRecord.user_id == user_id) | (MissionRecord.user_id.is_(None)))

    records = query.all()

    medals = {'bronze': 0, 'silver': 0, 'gold': 0}
    for record in records:
        if record.tier in medals:
            medals[record.tier] += 1

    return success_response({'medals': medals})


@missions_bp.route('/recent', methods=['GET'])
def get_recent_completed_missions():
    limit = request.args.get('limit', 5, type=int)
    user_id = get_current_user_id()

    query = MissionRecord.query.filter(
        MissionRecord.preset_mission_id.isnot(None),
        MissionRecord.actual_duration > 0
    )

    if user_id:
        # 로그인 전 완료한 미션(user_id=None) + 로그인 후 본인 미션만 조회
        query = query.filter((MissionRecord.user_id == user_id) | (MissionRecord.user_id.is_(None)))

    records = query.order_by(MissionRecord.completed_at.desc()).limit(limit).all()

    return success_response({'missions': [record.to_dict() for record in records]})


@missions_bp.route('/by-tier/<tier>', methods=['GET'])
def get_missions_by_tier(tier):
    """특정 티어의 완료한 미션 목록 조회"""
    user_id = get_current_user_id()

    if tier not in ['bronze', 'silver', 'gold']:
        return jsonify({'error': 'Invalid tier. Must be bronze, silver, or gold'}), 400

    query = MissionRecord.query.filter(
        MissionRecord.tier == tier,
        MissionRecord.preset_mission_id.isnot(None),
        MissionRecord.actual_duration > 0
    )

    if user_id:
        # 로그인 전 완료한 미션(user_id=None) + 로그인 후 본인 미션만 조회
        query = query.filter((MissionRecord.user_id == user_id) | (MissionRecord.user_id.is_(None)))

    records = query.order_by(MissionRecord.completed_at.desc()).all()

    return success_response({'missions': [record.to_dict() for record in records]})


@missions_bp.route('', methods=['POST'])
def create_mission():
    data = request.get_json()

    if not data or 'title' not in data or 'duration' not in data:
        return jsonify({'error': 'title and duration are required'}), 400

    mission = Mission(
        title=data['title'],
        description=data.get('description'),
        duration=data['duration'],
        difficulty=data.get('difficulty', 'medium'),
        category=data.get('category')
    )

    try:
        db.session.add(mission)
        db.session.commit()
        return jsonify(mission.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@missions_bp.route('/generate-daily', methods=['POST'])
def generate_daily_missions_manually():
    from services.ai_mission_generator import generate_and_save_daily_missions

    try:
        generate_and_save_daily_missions()
        return jsonify({'message': '오늘의 미션이 성공적으로 생성되었습니다.'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@missions_bp.route('/daily', methods=['GET'])
def get_today_missions():
    today = datetime.now().date()
    daily_mission = DailyMission.query.filter_by(date=today).first()

    if not daily_mission:
        return jsonify({'error': '오늘의 미션이 아직 생성되지 않았습니다.'}), 404

    return jsonify({
        'date': daily_mission.date.isoformat(),
        'missions': daily_mission.to_mission_list()
    }), 200
