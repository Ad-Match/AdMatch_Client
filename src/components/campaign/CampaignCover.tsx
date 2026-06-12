type Props = {
  imageUrl?: string;
  alt: string;
  className?: string;
  overlay?: React.ReactNode;
};

export function CampaignCover({ imageUrl, alt, className = "", overlay }: Props) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-brand-primary-soft to-white ${className}`}>
      {imageUrl ? (
        <img src={imageUrl} alt={alt} className="h-full w-full object-cover" />
      ) : null}
      {overlay}
    </div>
  );
}
