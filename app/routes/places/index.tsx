import { Link } from "@remix-run/react";

export default function PlaceIndexPage() {
  return (
    <p>
      No place selected. Select a place on the left, or{" "}
      <Link to="new" className="text-blue-500 underline">
        create a new place.
      </Link>
    </p>
  );
}
