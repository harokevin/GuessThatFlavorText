using System;
using System.IO;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace GuessThatFlavorTextDotNetBackend;

public class Function1
{
    private readonly ILogger<Function1> _logger;

    public Function1(ILogger<Function1> logger)
    {
        _logger = logger;
    }

    [Function("HelloFunction")]
    public HttpResponseData Run([HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", Route = "hello")] HttpRequestData req)
    {
        _logger.LogInformation("C# HTTP trigger function processed a request.");

        var response = req.CreateResponse(System.Net.HttpStatusCode.OK);
        response.Headers.Add("Content-Type", "text/plain; charset=utf-8");

        string? hostJsonPath = Path.Combine(Environment.CurrentDirectory, "host.json");
        string hostJsonContents;

        if (File.Exists(hostJsonPath))
        {
            hostJsonContents = File.ReadAllText(hostJsonPath);
            _logger.LogInformation("Loaded host.json from {Path}", hostJsonPath);
        }
        else
        {
            hostJsonContents = "host.json not found.";
            _logger.LogWarning("Could not find host.json at {Path}", hostJsonPath);
        }

        response.WriteString($"Hello from Azure Functions!\n\nhost.json contents:\n{hostJsonContents}");
        return response;
    }
}
