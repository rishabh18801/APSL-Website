import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container-x flex min-h-[70vh] flex-col items-center justify-center pt-24 text-center">
      <p className="font-display text-8xl font-bold text-signal/30">404</p>
      <h1 className="mt-4 text-3xl font-semibold">Off the map</h1>
      <p className="mt-2 text-mist">We couldn't find that page.</p>
      <Link to="/" className="btn-primary mt-8">Back to home</Link>
    </div>
  );
}
