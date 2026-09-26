export default function ProductDescription({ content }) {
  return (
    <div className="prose prose-invert prose-stone max-w-none wrap-break-word product-description" dangerouslySetInnerHTML={{ __html: content }} />
  );
}