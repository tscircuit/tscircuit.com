# tscircuit.com

Build electronics with React. The website for tscircuit packages and the online tscircuit editor

<a href="https://console.algora.io/org/tscircuit/bounties?status=completed">
       <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fconsole.algora.io%2Fapi%2Fshields%2Ftscircuit%2Fbounties%3Fstatus%3Dcompleted" alt="Rewarded Bounties">
   </a>
   <a href="https://console.algora.io/org/tscircuit/bounties?status=open">
       <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fconsole.algora.io%2Fapi%2Fshields%2Ftscircuit%2Fbounties%3Fstatus%3Dopen" alt="Open Bounties">
   </a>


[Docs](https://docs.tscircuit.com) &middot; [Website](https://tscircuit.com) &middot; [Twitter](https://x.com/tscircuit) &middot; [discord](https://tscircuit.com/community/join-redirect) &middot; [Quickstart](https://docs.tscircuit.com/quickstart) &middot; [Online Playground](https://tscircuit.com/playground)

tscircuit.com is a web application for creating, sharing, and managing circuit designs using TypeScript and React. It provides an intuitive interface for designing circuit boards, packages, footprints, and 3D models.

## Features

- Create and edit circuit designs using TypeScript and React
- Real-time preview of PCB layouts and 3D models
- Share and collaborate on circuit designs
- AI-assisted circuit design and error correction
- Import and export designs in various formats

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (latest version)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/tscircuit/tscircuit.com.git
cd tscircuit.com
```

2. Install dependencies:

```bash
bun install
```

### Running the Development Server

To start the development server:

```bash
bun run dev
```

This command will build the fake API and start the Vite development server. Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

### Testing the AI in Development

Create a `.env` file with the following:

```bash
VITE_USE_DIRECT_AI_REQUESTS=true
VITE_ANTHROPIC_API_KEY=<your-key-here>
```

### Error Reporting

To enable Sentry error monitoring, set the `SENTRY_DSN` environment variable before running the app. The value will be exposed to the client as `VITE_SENTRY_DSN` and used to initialize Sentry.

### Building for Production

To build the project for production:

```bash
bun run build
```

This will create a production-ready build in the `dist` directory.

## Project Structure

- `src/`: Contains the main React application code
- `fake-snippets-api/`: Contains the mock API for development
- `public/`: Static assets
- `src/components/`: Reusable React components
- `src/hooks/`: Custom React hooks
- `src/pages/`: Main page components
- `src/lib/`: Utility functions and helpers
- `playwright-tests/`: Playwright test files
- `playwright-tests/snapshots/`: Visual regression test snapshots

## Snapshots

We use Playwright for visual regression testing. Snapshots are stored in the `playwright-tests/snapshots/` directory.

To update a single snapshot run...

```bash
bun run snapshot
```

This will prompt you to select a specific test file to update.

## Contributing

We welcome contributions to TSCircuit Snippets! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## Example Snippets

- [Arduino Nano Servo Breakout Board](https://tscircuit.com/Abse2001/Arduino-Nano-Servo-Breakout)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by [val.town](https://val.town), [codesandbox.io](https://codesandbox.io/), and [v0.dev](https://v0.dev)
- Built with [React](https://reactjs.org/), [Vite](https://vitejs.dev/), and [Tailwind CSS](https://tailwindcss.com/)

For more information, visit [tscircuit.com](https://tscircuit.com).
