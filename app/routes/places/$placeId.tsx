import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, Outlet, useCatch, useLoaderData } from "@remix-run/react";

import invariant from "tiny-invariant";

import { deletePlace, getPlaceById } from "~/models/place.server";
import { requireUserId } from "~/session.server";

export async function loader({ request, params }: LoaderArgs) {
  const userId = await requireUserId(request);
  invariant(params.placeId, "placeId not found");

  const place = await getPlaceById({ userId, id: params.placeId });
  if (!place) {
    throw new Response("Not Found", { status: 404 });
  }
  console.log("place is ", place);
  return json({ place });
}

export async function action({ request, params }: ActionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const method = formData.get("_method");

  if (method === "DELETE") {
    console.log("tryna delete");
    invariant(params.placeId, "placeId not found");
    await deletePlace({ id: params.placeId, userId });
    console.log("maybe its deleted?");
  }

  if (request.method === "POST") {
    console.log("it's a post");
  }
  return redirect("/places");
}

export default function PlaceDetailsPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <h3 className="text-2xl font-bold">{data.place.name}</h3>
      <p className="py-6">{data.place.notes}</p>
      <hr className="my-4" />
      <Form method="post">
        <input type="hidden" name="_method" value="DELETE"></input>
        <button
          type="submit"
          formMethod="DELETE"
          className="rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Delete
        </button>
      </Form>
      <Link to="edit" className="block p-4 text-xl text-blue-500">
        Edit
      </Link>
      <Outlet />
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Place not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
