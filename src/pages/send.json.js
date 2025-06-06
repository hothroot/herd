export const prerender = false;

const pageTitle = "Sent";
export function GET({ params, request }) {
  return new Response(null, {
      status: 404,
      statusText: "Not found",
    });
}

export async function POST({ params, request }) {
  const data = await request.formData();
  return new Response(
    JSON.stringify({
      name: data.get("name"),
      street: data.get("street"),
      city: data.get("city"),
      state: data.get("state"),
      zipcode: data.get("zipcode"),
      senator0: data.get("senator0"),
      senator1: data.get("senator1"),
      message: data.get("message"),
    }),
  );
}