

sender = input("Who is the sender of the email? ") 
subject = input("What is the subject of the email? ") 
message = input("What is the message of the email? ")

prompt  = "Imagine you are a digital assistant who helps people by reading their emails to them. To achieve this, you will receive an email in this format:“Sender:.., subject Line:..., Message:..”. You need to create a summary of the email in a short bullet point with the most important messages at the top of this list. The output should look like this: “[Name of sender or first part of email address] sent you a message: Message 1 … Message N Also, the messages should be concise and to the point. The input: “ Sender: " + sender + ", subject Line: "+ subject + ", Message: " + message ;

def gen_Prompt():
    return prompt
    

 
