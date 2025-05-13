from importlib.metadata import requires
from multiprocessing import process
import os
from openai import OpenAI 

import json





client = OpenAI(
  api_key= "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"
) 
prompt = "Act as an assistant who helps individuals by providing them with concise and informative summaries of their emails. You need to make sure that the exact tone and idea is correctly passed on the the user, so don’t make assumptions; always stick to the facts.  Being short and concise in summaries is very important because your job is to help users spend less time checking their emails. Also, there is no need transtion words just just the summaires one after another with asimecolon in between.   You will receive the most recent emails in this format: “ first message: Subject:  Body of Message: Next Message: Subject:  Body of Message: …”.  The first message represents the most recent email in the user's inbox; there can be up to 5 total messages in one message. The summaries need to get straight to the point and include all the information in the email. For example, An email asking the user about how they are doing, what is going on in their life, and other information about how they have been going places and asking the user if they can have a meeting to talk about some things. The output should be: “the sender,” you can try to find the name of the sender from the closing or signature or just have the sender, but the name is preferred, wants to have a meeting to discuss things; also the sender is doing the good, traveling, and inquires about your wellbeing. To further explain the example of the output you need to produce, the most important/fastest action required information should come before a less important one. Also, if there is more than one email make to put most important/fastest action need summaires first. Also the add this symbol \ between each summary. Focus only on the core action or information, omitting pleasantries. Maximum 1 sentence per summary.  Input:"



def chatAPICall(user_message): 
    user_message = prompt + user_message
    print(user_message)
    # Call the OpenAI API to get a chat completion
    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        store=True,
        messages=[
            {"role": "user", "content": user_message}
        ]
    )
    print(completion.choices[0].message) 
    answer = completion.choices[0].message.content
    print("the completion answer == "  + answer)
    answer = json.dumps(answer)
    return answer
