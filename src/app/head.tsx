export default function Head() {
  return (
    <>
      <link rel="preconnect" href="https://api.open-meteo.com" crossOrigin="" />
      <link
        rel="preconnect"
        href="https://air-quality-api.open-meteo.com"
        crossOrigin=""
      />
      <link
        rel="preload"
        as="image"
        imageSrcSet="/shared/house.png"
        imageSizes="(min-width:1280px) 450px, 90vw"
      />
      <link
        rel="preload"
        as="image"
        imageSrcSet="/shared/house.mobile.png"
        imageSizes="(min-width:1280px) 360px, 360px"
      />
    </>
  );
}
