import {useLoaderData} from '@remix-run/react';
import {json, type LoaderArgs} from '@shopify/remix-oxygen';
import type {SeoHandleFunction} from '@shopify/hydrogen';

const COLLECTION_QUERY = `#graphql
  query CollectionDetails($handle: String!) {
    collection(handle: $handle) {
      id
      title
      description
      handle
      products(first: 4) {
        nodes {
          id
          title
          publishedAt
          handle
          variants(first: 1) {
            nodes {
              id
              image {
                url
                altText
                width
                height
              }
              price {
                amount
                currencyCode
              }
              compareAtPrice {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  }
`;
const seo: SeoHandleFunction<typeof loader> = ({data}) => ({
  title: data?.collection?.title,
  description: data?.collection?.description.substr(0, 154),
});

export const handle = {
  seo,
};

export async function loader({params, context}: LoaderArgs) {
  const {handle} = params;

  if (!handle) {
    throw new Response('Params invalid', {status: 400});
  }

  const {collection} = await context.storefront.query(COLLECTION_QUERY, {
    variables: {
      handle,
    },
  });

  if (!collection) {
    throw new Response('Null', {status: 404});
  }

  return json({collection});
}

export default function Collection() {
  const {collection} = useLoaderData<typeof loader>();
  console.log('[COLLECTION]', collection);

  return (
    <>
      <header className="grid w-full gap-8 py-8 justify-items-start">
        <h1 className="text-4xl whitespace-pre-wrap font-bold inline-block">
          {collection.title}
        </h1>

        {collection.description && (
          <div className="flex items-baseline justify-between w-full">
            <div>
              <p className="max-w-md whitespace-pre-wrap inherit text-copy inline-block">
                {collection.description}
              </p>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
