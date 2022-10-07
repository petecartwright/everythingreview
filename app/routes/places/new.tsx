import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import * as React from "react";

import { createPlace } from "~/models/place.server";
import { requireUserId } from "~/session.server";
import invariant from "tiny-invariant";

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const name = formData.get("placeName");
  const notes = formData.get("notes") || "";
  const address = formData.get("address");
  const city = formData.get("city");
  const state = formData.get("state");
  const websiteUrl = formData.get("websiteUrl");

  if (typeof name !== "string" || name.length === 0) {
    return json(
      { errors: { name: "Name is required", body: null } },
      { status: 400 }
    );
  }

  invariant(typeof notes === "string", "name must be a string");
  invariant(typeof address === "string", "address must be a string");
  invariant(typeof city === "string", "city must be a string");
  invariant(typeof state === "string", "state must be a string");
  invariant(typeof websiteUrl === "string", "websiteUrl must be a string");

  try {
    const place = await createPlace({
      userId,
      name,
      notes,
      address,
      city,
      state,
      websiteUrl,
    });
    if (!place) {
      return json(
        { errors: { form: "Unable to create place", name: null, body: null } },
        { status: 400 }
      );
    }
    return redirect(`/places/${place.id}`);
  } catch (err) {
    return json(
      { errors: { form: null, name: "Name is required", body: null } },
      { status: 400 }
    );
  }
}

export default function NewPlacePage() {
  const actionData = useActionData<typeof action>();
  const titleRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.name) {
      titleRef.current?.focus();
    }
  }, [actionData]);

  return (
    <Form
      method="post"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: "100%",
      }}
    >
      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Name: </span>
          <input
            ref={titleRef}
            name="placeName"
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
            aria-invalid={actionData?.errors?.name ? true : undefined}
            aria-errormessage={
              actionData?.errors?.name ? "name-error" : undefined
            }
          />
        </label>
        {actionData?.errors?.name && (
          <div className="pt-1 text-red-700" id="name-error">
            {actionData.errors.name}
          </div>
        )}
      </div>

      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Notes: </span>
          <textarea
            name="notes"
            rows={8}
            className="w-full flex-1 rounded-md border-2 border-blue-500 py-2 px-3 text-lg leading-6"
          />
        </label>
      </div>

      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Order Again? </span>
          <input
            name="orderAgain"
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
          />
        </label>
      </div>

      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Address: </span>
          <input
            name="address"
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
          />
        </label>
      </div>

      <div>
        <label className="flex w-full flex-col gap-1">
          <span>City: </span>
          <input
            name="city"
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
          />
        </label>
      </div>

      <div>
        <label className="flex w-full flex-col gap-1">
          <span>State: </span>
          <input
            name="state"
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
          />
        </label>
      </div>

      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Website: </span>
          <input
            name="websiteUrl"
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
          />
        </label>
      </div>

      <div className="text-right">
        <button
          type="submit"
          className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Save
        </button>
      </div>
    </Form>
  );
}
