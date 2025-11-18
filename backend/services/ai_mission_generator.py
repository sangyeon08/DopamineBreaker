import google.generativeai as genai
import json
import re
from datetime import datetime, timedelta
from flask import current_app

class AIMissionGenerator:
    def __init__(self, api_key):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.5-flash')

    def generate_daily_missions(self, previous_missions=None):
        """
        매일 새로운 미션 13개를 생성합니다.
        - Bronze 5개: 3-10분
        - Silver 5개: 10-20분
        - Gold 3개: 20-40분

        Args:
            previous_missions: 전날 미션 리스트 (겹치지 않게 하기 위함)

        Returns:
            dict: 생성된 미션들
        """
        previous_missions_text = ""
        if previous_missions:
            previous_missions_text = "\n\n전날 생성된 미션들 (이와 겹치지 않게 해주세요):\n"
            for mission in previous_missions:
                previous_missions_text += f"- {mission['title']}: {mission['description']}\n"

        prompt = f"""도파민 디톡스 미션 13개를 빠르게 생성하세요.

규칙:
- Bronze 5개 (3-10분), Silver 5개 (10-20분), Gold 3개 (20-40분)
- 제목: 간결 (15자 이내)
- 설명: 동기부여 한줄 (40자 이내)
- duration은 최소값 사용 (Bronze: 3,5,7,8,10 / Silver: 10,12,15,18,20 / Gold: 20,25,30)
- category: physical, mental, health, social, creative
{previous_missions_text}

JSON만 출력:
{{
  "bronze": [
    {{"title": "제목", "description": "설명", "duration": 3, "category": "physical"}},
    {{"title": "제목", "description": "설명", "duration": 5, "category": "mental"}},
    {{"title": "제목", "description": "설명", "duration": 7, "category": "health"}},
    {{"title": "제목", "description": "설명", "duration": 8, "category": "social"}},
    {{"title": "제목", "description": "설명", "duration": 10, "category": "creative"}}
  ],
  "silver": [
    {{"title": "제목", "description": "설명", "duration": 10, "category": "physical"}},
    {{"title": "제목", "description": "설명", "duration": 12, "category": "mental"}},
    {{"title": "제목", "description": "설명", "duration": 15, "category": "health"}},
    {{"title": "제목", "description": "설명", "duration": 18, "category": "social"}},
    {{"title": "제목", "description": "설명", "duration": 20, "category": "creative"}}
  ],
  "gold": [
    {{"title": "제목", "description": "설명", "duration": 20, "category": "physical"}},
    {{"title": "제목", "description": "설명", "duration": 25, "category": "mental"}},
    {{"title": "제목", "description": "설명", "duration": 30, "category": "health"}}
  ]
}}"""

        try:
            response = self.model.generate_content(prompt)
            response_text = response.text.strip()

            # JSON 추출 (코드 블록이나 다른 텍스트가 포함되어 있을 수 있음)
            json_match = re.search(r'\{[\s\S]*\}', response_text)
            if json_match:
                response_text = json_match.group(0)

            missions_data = json.loads(response_text)

            # 유효성 검증
            if not self._validate_missions(missions_data):
                raise ValueError("생성된 미션이 규칙을 따르지 않습니다.")

            return missions_data

        except Exception as e:
            # 로깅 (앱 컨텍스트가 있을 경우에만)
            try:
                current_app.logger.error(f"AI 미션 생성 실패: {str(e)}")
            except RuntimeError:
                print(f"AI 미션 생성 실패: {str(e)}")
            # 폴백: 기본 미션 반환
            return self._get_fallback_missions()

    def _validate_missions(self, missions_data):
        """생성된 미션의 유효성을 검증합니다."""
        try:
            # Bronze 5개, Silver 5개, Gold 3개가 있는지 확인
            if len(missions_data.get('bronze', [])) != 5:
                return False
            if len(missions_data.get('silver', [])) != 5:
                return False
            if len(missions_data.get('gold', [])) != 3:
                return False

            # Bronze 미션 시간 검증 (3-10분)
            for mission in missions_data['bronze']:
                if not (3 <= mission['duration'] <= 10):
                    return False

            # Silver 미션 시간 검증 (10-20분)
            for mission in missions_data['silver']:
                if not (10 <= mission['duration'] <= 20):
                    return False

            # Gold 미션 시간 검증 (20-40분)
            for mission in missions_data['gold']:
                if not (20 <= mission['duration'] <= 40):
                    return False

            return True

        except (KeyError, TypeError):
            return False

    def _get_fallback_missions(self):
        """API 실패 시 사용할 기본 미션"""
        return {
            "bronze": [
                {"title": "목과 어깨 스트레칭", "description": "간단한 스트레칭으로 긴장을 풀어보세요", "duration": 3, "category": "physical"},
                {"title": "깊은 호흡 연습", "description": "깊은 호흡으로 마음을 안정시켜보세요", "duration": 5, "category": "mental"},
                {"title": "물 마시기", "description": "물 한 잔을 천천히 마시며 수분을 보충하세요", "duration": 7, "category": "health"},
                {"title": "눈 운동하기", "description": "눈의 피로를 풀어주는 간단한 운동", "duration": 8, "category": "health"},
                {"title": "창밖 바라보기", "description": "창밖을 보며 잠시 휴식을 취하세요", "duration": 10, "category": "mental"}
            ],
            "silver": [
                {"title": "짧은 산책", "description": "밖에 나가서 신선한 공기를 마시며 걸어보세요", "duration": 10, "category": "physical"},
                {"title": "독서 시간", "description": "좋아하는 책을 읽으며 휴식을 취해보세요", "duration": 12, "category": "mental"},
                {"title": "정리 정돈", "description": "책상이나 주변을 깔끔하게 정리해보세요", "duration": 15, "category": "health"},
                {"title": "전화하기", "description": "소중한 사람에게 전화로 안부 전하기", "duration": 18, "category": "social"},
                {"title": "간단한 요리", "description": "간단한 요리나 간식을 만들어보세요", "duration": 20, "category": "creative"}
            ],
            "gold": [
                {"title": "명상과 집중", "description": "조용한 곳에서 집중 명상을 해보세요", "duration": 20, "category": "mental"},
                {"title": "요가 루틴", "description": "기본 요가 동작으로 몸과 마음을 정돈하세요", "duration": 25, "category": "physical"},
                {"title": "일기 쓰기", "description": "오늘 하루를 돌아보며 일기를 써보세요", "duration": 30, "category": "mental"}
            ]
        }


def generate_and_save_daily_missions():
    """매일 자정에 실행될 함수 - 새로운 미션을 생성하고 저장합니다."""
    from database import db
    from models.daily_mission import DailyMission

    def log(message, level='info'):
        """로깅 헬퍼 함수"""
        try:
            if level == 'error':
                current_app.logger.error(message)
            else:
                current_app.logger.info(message)
        except RuntimeError:
            print(message)

    # Gemini API 키 가져오기
    api_key = current_app.config.get('GEMINI_API_KEY')
    if not api_key:
        log("GEMINI_API_KEY가 설정되지 않았습니다.", 'error')
        return

    # 오늘 날짜
    today = datetime.now().date()

    # 이미 오늘 미션이 생성되어 있는지 확인
    existing_mission = DailyMission.query.filter_by(date=today).first()
    if existing_mission:
        log(f"오늘({today}) 미션이 이미 생성되어 있습니다.")
        return

    # 전날 미션 가져오기 (겹치지 않게 하기 위함)
    yesterday = today - timedelta(days=1)
    previous_daily_mission = DailyMission.query.filter_by(date=yesterday).first()
    previous_missions = None
    if previous_daily_mission:
        previous_missions = previous_daily_mission.to_mission_list()

    # AI로 미션 생성
    generator = AIMissionGenerator(api_key)
    missions_data = generator.generate_daily_missions(previous_missions)

    # 데이터베이스에 저장
    daily_mission = DailyMission(
        date=today,
        bronze_1_title=missions_data['bronze'][0]['title'],
        bronze_1_description=missions_data['bronze'][0]['description'],
        bronze_1_duration=missions_data['bronze'][0]['duration'],
        bronze_2_title=missions_data['bronze'][1]['title'],
        bronze_2_description=missions_data['bronze'][1]['description'],
        bronze_2_duration=missions_data['bronze'][1]['duration'],
        bronze_3_title=missions_data['bronze'][2]['title'],
        bronze_3_description=missions_data['bronze'][2]['description'],
        bronze_3_duration=missions_data['bronze'][2]['duration'],
        bronze_4_title=missions_data['bronze'][3]['title'],
        bronze_4_description=missions_data['bronze'][3]['description'],
        bronze_4_duration=missions_data['bronze'][3]['duration'],
        bronze_5_title=missions_data['bronze'][4]['title'],
        bronze_5_description=missions_data['bronze'][4]['description'],
        bronze_5_duration=missions_data['bronze'][4]['duration'],
        silver_1_title=missions_data['silver'][0]['title'],
        silver_1_description=missions_data['silver'][0]['description'],
        silver_1_duration=missions_data['silver'][0]['duration'],
        silver_2_title=missions_data['silver'][1]['title'],
        silver_2_description=missions_data['silver'][1]['description'],
        silver_2_duration=missions_data['silver'][1]['duration'],
        silver_3_title=missions_data['silver'][2]['title'],
        silver_3_description=missions_data['silver'][2]['description'],
        silver_3_duration=missions_data['silver'][2]['duration'],
        silver_4_title=missions_data['silver'][3]['title'],
        silver_4_description=missions_data['silver'][3]['description'],
        silver_4_duration=missions_data['silver'][3]['duration'],
        silver_5_title=missions_data['silver'][4]['title'],
        silver_5_description=missions_data['silver'][4]['description'],
        silver_5_duration=missions_data['silver'][4]['duration'],
        gold_1_title=missions_data['gold'][0]['title'],
        gold_1_description=missions_data['gold'][0]['description'],
        gold_1_duration=missions_data['gold'][0]['duration'],
        gold_2_title=missions_data['gold'][1]['title'],
        gold_2_description=missions_data['gold'][1]['description'],
        gold_2_duration=missions_data['gold'][1]['duration'],
        gold_3_title=missions_data['gold'][2]['title'],
        gold_3_description=missions_data['gold'][2]['description'],
        gold_3_duration=missions_data['gold'][2]['duration'],
    )

    try:
        db.session.add(daily_mission)
        db.session.commit()
        log(f"오늘({today}) 미션이 성공적으로 생성되었습니다.")
    except Exception as e:
        db.session.rollback()
        log(f"미션 저장 실패: {str(e)}", 'error')