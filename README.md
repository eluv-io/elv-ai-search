# AI Clip Search

A versatile tool designed to simplify the process of searching for specific content within a large collection, automatically generating clips from that content. The app also includes feedback collection features, allowing users to participate in tag correction and rate search result rankings.

Key features include:

- **Search Functionality**: The app provides a powerful search engine, enabling users to enter keywords, tags, or criteria to find content quickly and accurately.
- **Clip Generation**: The app automatically generates clips that match search phrases, with start and end times determined by an ML-based shot boundary detection model.
- **Multi-Media Support**: The app supports various media types, including video, audio, and images.
- **Feedback and Rating**: Users can provide feedback on labels or tags, content quality, accuracy, and search result rankings.

## Installation

To set up the project locally, ensure you have the following installated:
- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [Eluvio Core JS](elv-core-js)

1. Clone the repository:
    ```bash
    git clone https://github.com/eluv-io/elv-ai-search.git
    ```
2. Navigate to the project directory:
    ```bash
    cd elv-ai-search
    ```
3. Install dependencies:
    ```bash
    npm install
    ```

## Usage
To start the application in development mode:

```bash
npm run serve
```

## Contributing

- Create a new branch for your work.
- Follow the code style of the project.
- Run linting with `npm run lint` and ensure all checks pass before submitting a PR.
- Request a code review and fix all issues raised by the reviewer.

