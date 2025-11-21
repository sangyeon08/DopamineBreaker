from datetime import datetime
from database import db

class DailyMission(db.Model):
    __tablename__ = 'daily_missions'

    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False, unique=True, index=True)

    bronze_1_title = db.Column(db.String(100), nullable=False)
    bronze_1_description = db.Column(db.Text, nullable=False)
    bronze_1_duration = db.Column(db.Integer, nullable=False)

    bronze_2_title = db.Column(db.String(100), nullable=False)
    bronze_2_description = db.Column(db.Text, nullable=False)
    bronze_2_duration = db.Column(db.Integer, nullable=False)

    bronze_3_title = db.Column(db.String(100), nullable=False)
    bronze_3_description = db.Column(db.Text, nullable=False)
    bronze_3_duration = db.Column(db.Integer, nullable=False)

    bronze_4_title = db.Column(db.String(100), nullable=False)
    bronze_4_description = db.Column(db.Text, nullable=False)
    bronze_4_duration = db.Column(db.Integer, nullable=False)

    bronze_5_title = db.Column(db.String(100), nullable=False)
    bronze_5_description = db.Column(db.Text, nullable=False)
    bronze_5_duration = db.Column(db.Integer, nullable=False)

    silver_1_title = db.Column(db.String(100), nullable=False)
    silver_1_description = db.Column(db.Text, nullable=False)
    silver_1_duration = db.Column(db.Integer, nullable=False)

    silver_2_title = db.Column(db.String(100), nullable=False)
    silver_2_description = db.Column(db.Text, nullable=False)
    silver_2_duration = db.Column(db.Integer, nullable=False)

    silver_3_title = db.Column(db.String(100), nullable=False)
    silver_3_description = db.Column(db.Text, nullable=False)
    silver_3_duration = db.Column(db.Integer, nullable=False)

    silver_4_title = db.Column(db.String(100), nullable=False)
    silver_4_description = db.Column(db.Text, nullable=False)
    silver_4_duration = db.Column(db.Integer, nullable=False)

    silver_5_title = db.Column(db.String(100), nullable=False)
    silver_5_description = db.Column(db.Text, nullable=False)
    silver_5_duration = db.Column(db.Integer, nullable=False)

    gold_1_title = db.Column(db.String(100), nullable=False)
    gold_1_description = db.Column(db.Text, nullable=False)
    gold_1_duration = db.Column(db.Integer, nullable=False)

    gold_2_title = db.Column(db.String(100), nullable=False)
    gold_2_description = db.Column(db.Text, nullable=False)
    gold_2_duration = db.Column(db.Integer, nullable=False)

    gold_3_title = db.Column(db.String(100), nullable=False)
    gold_3_description = db.Column(db.Text, nullable=False)
    gold_3_duration = db.Column(db.Integer, nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<DailyMission {self.date}>'

    def to_mission_list(self):
        return [
            {'id': 1, 'title': self.bronze_1_title, 'description': self.bronze_1_description, 'duration': self.bronze_1_duration, 'tier': 'bronze', 'category': 'ai_generated'},
            {'id': 2, 'title': self.bronze_2_title, 'description': self.bronze_2_description, 'duration': self.bronze_2_duration, 'tier': 'bronze', 'category': 'ai_generated'},
            {'id': 3, 'title': self.bronze_3_title, 'description': self.bronze_3_description, 'duration': self.bronze_3_duration, 'tier': 'bronze', 'category': 'ai_generated'},
            {'id': 4, 'title': self.bronze_4_title, 'description': self.bronze_4_description, 'duration': self.bronze_4_duration, 'tier': 'bronze', 'category': 'ai_generated'},
            {'id': 5, 'title': self.bronze_5_title, 'description': self.bronze_5_description, 'duration': self.bronze_5_duration, 'tier': 'bronze', 'category': 'ai_generated'},
            {'id': 6, 'title': self.silver_1_title, 'description': self.silver_1_description, 'duration': self.silver_1_duration, 'tier': 'silver', 'category': 'ai_generated'},
            {'id': 7, 'title': self.silver_2_title, 'description': self.silver_2_description, 'duration': self.silver_2_duration, 'tier': 'silver', 'category': 'ai_generated'},
            {'id': 8, 'title': self.silver_3_title, 'description': self.silver_3_description, 'duration': self.silver_3_duration, 'tier': 'silver', 'category': 'ai_generated'},
            {'id': 9, 'title': self.silver_4_title, 'description': self.silver_4_description, 'duration': self.silver_4_duration, 'tier': 'silver', 'category': 'ai_generated'},
            {'id': 10, 'title': self.silver_5_title, 'description': self.silver_5_description, 'duration': self.silver_5_duration, 'tier': 'silver', 'category': 'ai_generated'},
            {'id': 11, 'title': self.gold_1_title, 'description': self.gold_1_description, 'duration': self.gold_1_duration, 'tier': 'gold', 'category': 'ai_generated'},
            {'id': 12, 'title': self.gold_2_title, 'description': self.gold_2_description, 'duration': self.gold_2_duration, 'tier': 'gold', 'category': 'ai_generated'},
            {'id': 13, 'title': self.gold_3_title, 'description': self.gold_3_description, 'duration': self.gold_3_duration, 'tier': 'gold', 'category': 'ai_generated'}
        ]
