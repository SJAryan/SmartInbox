from openai import OpenAI
import prompt



client = OpenAI(
  api_key="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"
)



def chatAPICall(user_message):
    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        store=True,
        messages=[
            {"role": "user", "content": user_message}
        ]
    )
    print(completion.choices[0].message)
    return completion.choices[0].message
