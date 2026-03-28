export default function LineItem({ img, width, height }) {
	return (
		<div
  className="flex h-[86px] w-[216px] shrink-0 items-center justify-center rounded-[12px]"
  style={{
    background: "linear-gradient(var(--color-line-background), var(--color-line-background)) padding-box, linear-gradient(180deg, #1E1E20 0%, #101012 50%, #1E1E20 100%) border-box",
    border: "1px solid transparent",
  }}
>
  <img
    src={img}
    alt=""
    className="max-h-full max-w-full object-contain"
    style={{ width, height }}
  />
</div>
	);
}
