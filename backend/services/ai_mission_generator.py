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
        previous_missions_text = ""
        if previous_missions:
            previous_missions_text = "\n\n전날 생성된 미션들 (이와 겹치지 않게 해주세요):\n"
            for mission in previous_missions:
                previous_missions_text += f"- {mission['title']}: {mission['description']}\n"

        prompt = f"""도파민 디톡스를 위한 건강한 활동 미션 13개를 생성해주세요.

요구사항:
1. Bronze 미션 5개: 3-10분 소요되는 쉬운 활동
2. Silver 미션 5개: 10-20분 소요되는 중간 난이도 활동
3. Gold 미션 3개: 20-40분 소요되는 챌린지 활동

각 미션:
- title: 한글로 간결하게 (10자 이내)
- description: 동기부여 문구 (20자 이내)
- duration: 최소값 사용 (Bronze: 3~10, Silver: 10~20, Gold: 20~40)
- category: physical, mental, health, social, creative 중 하나
{previous_missions_text}


[규칙]
1. 감성, 비유, 은유, 꾸밈 표현을 모두 제거한다.
2. ‘아름답다, 특별하다, 느껴보세요’ 같은 감성 단어를 쓰지 않는다.
3. 문장의 목적이 무엇인지 분석하여 실제 지시 내용만 남긴다.
4. 가능하면 ‘~하세요, ~을 수행하세요, ~을 확인하세요’ 같은 형태로 정리한다.
5. 전달해야 하는 사실·행동·조건만 남기고 나머지는 모두 삭제한다.

아래 JSON 형식으로만 응답해주세요. 최대한 의미가 모호하지 않게 명확히 표현하세요. :
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
            try:
                current_app.logger.info("AI 미션 생성 시작")
            except RuntimeError:
                print("AI 미션 생성 시작")

            response = self.model.generate_content(prompt)
            response_text = response.text.strip()

            try:
                current_app.logger.info(f"AI 응답 원본: {response_text[:200]}...")
            except RuntimeError:
                print(f"AI 응답 원본: {response_text[:200]}...")

            json_match = re.search(r'\{[\s\S]*\}', response_text)
            if json_match:
                response_text = json_match.group(0)
            else:
                raise ValueError("응답에서 JSON을 찾을 수 없습니다.")

            try:
                current_app.logger.info(f"파싱된 JSON: {response_text[:200]}...")
            except RuntimeError:
                print(f"파싱된 JSON: {response_text[:200]}...")

            missions_data = json.loads(response_text)

            if not self._validate_missions(missions_data):
                error_msg = f"유효성 검증 실패 - bronze: {len(missions_data.get('bronze', []))}, silver: {len(missions_data.get('silver', []))}, gold: {len(missions_data.get('gold', []))}"
                raise ValueError(error_msg)

            try:
                current_app.logger.info("AI 미션 생성 성공")
            except RuntimeError:
                print("AI 미션 생성 성공")

            return missions_data

        except Exception as e:
            error_msg = f"AI 미션 생성 실패: {str(e)}"
            try:
                current_app.logger.error(error_msg)
            except RuntimeError:
                print(error_msg)
            raise Exception(error_msg)

    def _validate_missions(self, missions_data):
        try:
            if len(missions_data.get('bronze', [])) != 5:
                return False
            if len(missions_data.get('silver', [])) != 5:
                return False
            if len(missions_data.get('gold', [])) != 3:
                return False

            for mission in missions_data['bronze']:
                if not (3 <= mission['duration'] <= 10):
                    return False

            for mission in missions_data['silver']:
                if not (10 <= mission['duration'] <= 20):
                    return False

            for mission in missions_data['gold']:
                if not (20 <= mission['duration'] <= 40):
                    return False

            return True

        except (KeyError, TypeError):
            return False


def generate_and_save_daily_missions():
    from database import db
    from models.daily_mission import DailyMission

    def log(message, level='info'):
        try:
            if level == 'error':
                current_app.logger.error(message)
            else:
                current_app.logger.info(message)
        except RuntimeError:
            print(message)

    api_key = current_app.config.get('GEMINI_API_KEY')
    if not api_key:
        log("GEMINI_API_KEY가 설정되지 않았습니다.", 'error')
        return

    today = datetime.now().date()

    existing_mission = DailyMission.query.filter_by(date=today).first()
    if existing_mission:
        log(f"오늘({today}) 미션이 이미 생성되어 있습니다.")
        return

    yesterday = today - timedelta(days=1)
    previous_daily_mission = DailyMission.query.filter_by(date=yesterday).first()
    previous_missions = None
    if previous_daily_mission:
        previous_missions = previous_daily_mission.to_mission_list()

    generator = AIMissionGenerator(api_key)
    missions_data = generator.generate_daily_missions(previous_missions)

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
