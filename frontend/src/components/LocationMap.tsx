type AddressParts = {
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
};

export function LocationMap({
  latitude,
  longitude,
  onLocated,
}: {
  latitude: number | null;
  longitude: number | null;
  onLocated: (
    latitude: number,
    longitude: number,
    parts: AddressParts,
  ) => void;
}) {
  const locate = () => {
    if (!navigator.geolocation) {
      return;
    }
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      let parts: AddressParts = {};
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
          { headers: { Accept: 'application/json' } },
        );
        const data = (await response.json()) as {
          display_name?: string;
          address?: {
            road?: string;
            suburb?: string;
            city?: string;
            town?: string;
            village?: string;
            state?: string;
            postcode?: string;
          };
        };
        parts = {
          address: data.display_name,
          city: data.address?.city ?? data.address?.town ?? data.address?.village,
          state: data.address?.state,
          pincode: data.address?.postcode,
        };
      } catch {
        parts = {};
      }
      onLocated(lat, lng, parts);
    });
  };

  const mapSrc =
    latitude != null && longitude != null
      ? `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.02}%2C${latitude - 0.02}%2C${longitude + 0.02}%2C${latitude + 0.02}&layer=mapnik&marker=${latitude}%2C${longitude}`
      : null;

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={locate}
        className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-800 hover:bg-teal-100"
      >
        Use current location
      </button>
      {mapSrc ? (
        <iframe
          title="Delivery location"
          src={mapSrc}
          className="h-56 w-full rounded-2xl border border-slate-200"
        />
      ) : (
        <p className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
          Pin your address on the map to help with delivery.
        </p>
      )}
    </div>
  );
}
