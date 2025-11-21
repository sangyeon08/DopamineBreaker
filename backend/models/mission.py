from datetime import datetime
from database import db

class Mission(db.Model):
    """미션 모델"""
    __tablename__ = 'missions'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    duration = db.Column(db.Integer, nullable=False)
    difficulty = db.Column(db.String(20))
    category = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    records = db.relationship('MissionRecord', backref='mission', lazy=True)

    def __repr__(self):
        return f'<Mission {self.title}>'

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'duration': self.duration,
            'difficulty': self.difficulty,
            'category': self.category,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class MissionRecord(db.Model):
    """미션 완료 기록 모델"""
    __tablename__ = 'mission_records'

    id = db.Column(db.Integer, primary_key=True)
    # nullable=True: 비로그인 사용자 미션 기록 지원
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    mission_id = db.Column(db.Integer, db.ForeignKey('missions.id'), nullable=True)
    # 일일 프리셋 미션의 경우 preset_mission_id 사용
    preset_mission_id = db.Column(db.Integer, nullable=True)
    tier = db.Column(db.String(20), nullable=True)
    title = db.Column(db.String(100), nullable=True)
    description = db.Column(db.Text, nullable=True)
    completed_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    # actual_duration=0: 실패/취소된 미션, >0: 완료된 미션
    actual_duration = db.Column(db.Integer)
    notes = db.Column(db.Text)

    def __repr__(self):
        return f'<MissionRecord mission_id={self.mission_id} completed_at={self.completed_at}>'

    def to_dict(self):
        return {
            'id': self.id,
            'mission_id': self.mission_id,
            'preset_mission_id': self.preset_mission_id,
            'tier': self.tier,
            'title': self.title,
            'description': self.description,
            # 연관된 미션 정보가 있으면 포함 (커스텀 미션의 경우)
            'mission': self.mission.to_dict() if self.mission else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'actual_duration': self.actual_duration,
            'notes': self.notes
        }
