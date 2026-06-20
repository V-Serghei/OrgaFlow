using OrgaFlow.Application.Proxy.Interfaces;
using OrgaFlow.Contracts.Requests.ChainOfResponsibility;
using OrgaFlow.Contracts.Responses.ChainOfResponsibility;

namespace OrgaFlow.Application.ChainOfResponsibility.Emails;

public class EmailOperationHandler: BaseRequestHandler<EmailOperationRequest, EmailOperationResponse>
    {
        private readonly IEmailService _emailService;
        
        public EmailOperationHandler(IEmailService emailService)
        {
            _emailService = emailService;
        }
        
        public override async Task<RequestContext<EmailOperationRequest, EmailOperationResponse>> HandleAsync(
            RequestContext<EmailOperationRequest, EmailOperationResponse> context)
        {
            if (context.IsHandled)
            {
                return context;
            }
            
            try
            {
                switch (context.Request.Operation)
                {
                    case "GetInbox":
                        if (context.Request.Auth == null)
                        {
                            context.ErrorMessage = "Email authentication data is required";
                            context.ErrorCode = "MISSING_AUTH";
                            break;
                        }
                        
                        var messages = await _emailService.GetInboxAsync(context.Request.Auth);
                        context.Response = new EmailOperationResponse { Messages = messages };
                        break;
                        
                    case "GetDetails":
                        if (context.Request.Auth == null)
                        {
                            context.ErrorMessage = "Email authentication data is required";
                            context.ErrorCode = "MISSING_AUTH";
                            break;
                        }
                        
                        if (string.IsNullOrEmpty(context.Request.MessageUid))
                        {
                            context.ErrorMessage = "Message UID is required";
                            context.ErrorCode = "MISSING_UID";
                            break;
                        }
                        
                        var messageDetail = await _emailService.GetEmailDetailsAsync(context.Request.MessageUid, context.Request.Auth);
                        context.Response = new EmailOperationResponse { MessageDetail = messageDetail };
                        break;
                        
                    case "Send":
                        if (context.Request.SendData == null)
                        {
                            context.ErrorMessage = "Email send data is required";
                            context.ErrorCode = "MISSING_DATA";
                            break;
                        }
                        
                        await _emailService.SendEmailAsync(context.Request.SendData);
                        context.Response = new EmailOperationResponse();
                        break;
                        
                    case "Trash":
                        if (context.Request.ActionData == null)
                        {
                            context.ErrorMessage = "Email action data is required";
                            context.ErrorCode = "MISSING_DATA";
                            break;
                        }
                        
                        await _emailService.TrashEmailsAsync(context.Request.ActionData);
                        context.Response = new EmailOperationResponse();
                        break;
                        
                    default:
                        context.ErrorMessage = $"Unknown operation: {context.Request.Operation}";
                        context.ErrorCode = "UNKNOWN_OPERATION";
                        break;
                }
            }
            catch (UnauthorizedAccessException ex)
            {
                context.ErrorMessage = ex.Message;
                context.ErrorCode = "UNAUTHORIZED";
            }
            catch (HttpRequestException ex)
            {
                context.ErrorMessage = $"Email service communication error: {ex.Message}";
                context.ErrorCode = "EMAIL_SERVICE_ERROR";
            }
            catch (Exception ex)
            {
                context.ErrorMessage = $"Error executing email operation: {ex.Message}";
                context.ErrorCode = "OPERATION_ERROR";
            }
            
            context.IsHandled = true;
            return context;
        }
    }