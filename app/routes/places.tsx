import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";

import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";
import { getPlacesByUser } from "~/models/place.server";

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  //TODO - convert to places
  const placeListItems = await getPlacesByUser({ userId });
  //TODO - convert to places
  return json({ placeListItems });
}

export default function PlacesPage() {
  const data = useLoaderData<typeof loader>();
  const user = useUser();

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <h1 className="text-3xl font-bold">
          <Link to=".">Places</Link>
        </h1>
        <p>{user.email}</p>
        <Form action="/logout" method="post">
          <button
            type="submit"
            className="rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
          >
            Logout
          </button>
        </Form>
      </header>

      <main className="flex h-full bg-white">
        <div className="h-full w-80 border-r bg-gray-50">
          <Link to="new" className="block p-4 text-xl text-blue-500">
            + New Place
          </Link>

          <hr />
          {/* //TODO - convert to places */}
          {data.placeListItems.length === 0 ? (
            <p className="p-4">No places yet</p>
          ) : (
            <ol>
              {/* //TODO - convert to places */}
              {data.placeListItems.map((place) => (
                <li key={place.id}>
                  <NavLink
                    className={({ isActive }) =>
                      `block border-b p-4 text-xl ${isActive ? "bg-white" : ""}`
                    }
                    to={place.id}
                  >
                    📝 {place.name}
                  </NavLink>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
