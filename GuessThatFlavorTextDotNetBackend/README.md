# GuessThatFlavorTextDotNetBackend

This folder contains the .NET Azure Functions backend for GuessThatFlavorText.

## Run locally

### Prerequisites
- .NET 8 SDK
- Azure Functions Core Tools

### Start the function app

```bash
cd GuessThatFlavorTextDotNetBackend
func start
```

The sample hello endpoint will be available at:

```text
http://localhost:7071/api/hello
```

### Build the project

```bash
cd GuessThatFlavorTextDotNetBackend
dotnet build
```

## Deploy to Azure

### 1. Sign in to Azure

```bash
az login
```

### 2. Publish the function app

```bash
cd GuessThatFlavorTextDotNetBackend
dotnet publish -c Release -o ./publish
cd publish
zip -r ../publish.zip .
cd ..
az functionapp deployment source config-zip \
  --resource-group GuessThatFlavorTextDotNetBackend_group \
  --name GuessThatFlavorTextDotNetBackend \
  --src ./publish.zip
```

### 3. Verify the deployed endpoint

```bash
curl https://<your-function-app-name>.azurewebsites.net/api/hello
```
