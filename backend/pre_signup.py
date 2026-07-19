def handler(event, context):
    # Skips the email-verification-code step entirely - every sign-up is
    # confirmed and marked verified immediately.
    event["response"]["autoConfirmUser"] = True
    event["response"]["autoVerifyEmail"] = True
    return event
