
# Python Flask Backend

This is a simple Python Flask backend project.

## Setup Instructions

1. **Install Python**
	- Download and install Python from [python.org](https://www.python.org/downloads/).

2. **Install dependencies**
	- Open a terminal in this folder and run:
	  ```sh
	  pip install flask awsgi
	  ```

## Running the App

To start the Flask server, run:
```sh
python main.py
```

The app will be available at [http://localhost:5000](http://localhost:5000).

## Project Structure

- `main.py` — Main application file
- `README.md` — Project instructions

## Notes

- Make sure you are using the correct Python environment (virtualenv recommended).
- For AWS Lambda deployments, `awsgi` is used to adapt Flask for serverless hosting.


## Source of data

https://github.com/PokemonTCG/pokemon-tcg-data


## How to pacakge the layer for AWS:
1. In WSL or linux
```
$ wsl
```

1. Create Lambda Layers:
(folder name must be python for AWS to recoginze the dependencies)

#### Flask Layer

Create the Flask dependency layer:

```bash
mkdir -p flask-layer/python
pip install Flask -t flask-layer/python
cd flask-layer
zip -r ../flask-layer.zip python
cd ..
```

#### Serverless WSGI Layer

Create the serverless-wsgi dependency layer:

```bash
mkdir -p serverless-wsgi-layer/python
pip install serverless-wsgi -t serverless-wsgi-layer/python
cd serverless-wsgi-layer
zip -r ../serverless-wsgi-layer.zip python
cd ..
```

1. Upload layer.zip as your Lambda layer.


## Kudos To:
https://github.com/vastevenson/flask-on-lambda-free
https://www.youtube.com/watch?v=PkD5jI4x__0