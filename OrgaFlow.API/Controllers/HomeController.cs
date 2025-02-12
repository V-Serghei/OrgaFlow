using Microsoft.AspNetCore.Mvc;

namespace OrgaFlow.Application.Controllers;

[Route("")]
public class HomeController : Controller
{
    [HttpGet]
    public IActionResult Index()
    {
        var htmlContent = @"
            <!DOCTYPE html>
            <html lang='en'>
            <head>
                <meta charset='UTF-8'>
                <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                <title>OrgaFlow API</title>
            </head>
            <body>
                <h1>OrgaFlow API is running!</h1>
                <p>Try API: <a href='/api/user/1'>Get User by ID</a></p>
            </body>
            </html>";

        return Content(htmlContent, "text/html");
    }
}