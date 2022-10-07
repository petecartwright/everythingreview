import type { User, Place } from "@prisma/client";
import { prisma } from "~/db.server";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import slugify from "slugify";

export type { Place } from "@prisma/client";

export function getPlaceById({
  id,
  userId,
}: Partial<Pick<Place, "id" | "slug">> & {
  userId: User["id"];
}) {
  return prisma.place.findFirst({
    // select: { id: true, name: true, slug: true },
    where: { id, creatorId: userId },
  });
}

export function getPlaceBySlug({
  slug,
  userId,
}: Pick<Place, "slug"> & {
  userId: User["id"];
}) {
  return prisma.place.findFirst({
    select: { id: true, name: true, slug: true },
    where: { slug, creatorId: userId },
  });
}

export function getNextSlug({ slug }: Pick<Place, "slug">) {
  // before writing a slug to the database, make sure it isn't
  // already in use

  // See if we've already iterated this one
  // Check for the slug
  const biggestSlug = prisma.place.findFirst({
    select: { id: true, name: true, slug: true },
    where: {
      slug: {
        startsWith: `${slug}'`,
      },
    },
    orderBy: {
      slug: "desc",
    },
  });
}

export function getPlacesByUser({ userId }: { userId: User["id"] }) {
  return prisma.place.findMany({
    where: { creatorId: userId },
    select: { id: true, name: true },
    orderBy: { updatedAt: "desc" },
  });
}

export function createPlace({
  userId,
  name,
  notes,
  address,
  city,
  state,
  websiteUrl,
}: Pick<
  Place,
  "name" | "notes" | "address" | "city" | "state" | "websiteUrl"
> & {
  userId: User["id"];
}) {
  let slug = slugify(name);
  let place;
  try {
    place = prisma.place.create({
      data: {
        name,
        slug,
        address,
        city,
        notes,
        state,
        websiteUrl,
        creator: {
          connect: {
            id: userId,
          },
        },
      },
    });
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError) {
      // https://www.prisma.io/docs/reference/api-reference/error-reference#p2002
      if (err.meta?.target === "slug" && err.code === "P2002") {
        console.log("Duplicate slug");
        // Is this the most efficient way to generate slugs? no.
        // Will I be getting many collisions? no.
        // will this bother me until I fix it one day? yes.
        slug = slug + "-1";
        place = prisma.place.create({
          data: {
            name,
            slug,
            address,
            city,
            notes,
            state,
            websiteUrl,
            creator: {
              connect: {
                id: userId,
              },
            },
          },
        });
      }
    } else {
      console.log("Error creating place ", err);
      throw err;
    }
  }

  return place;
}

export function deletePlace({
  id,
  userId,
}: Pick<Place, "id"> & { userId: User["id"] }) {
  console.log("about to delete");
  const deleteResults = prisma.place.deleteMany({
    where: { id, creatorId: userId },
  });
  console.log("deleteResults ", deleteResults);
  return deleteResults;
}
