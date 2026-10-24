import { useEffect, useState } from 'react';

export default function DoctorAvatar({ doctor, size = '' }) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = doctor?.profileImageUrl?.trim();
  const className = `avatar${size ? ` ${size}` : ''}${imageUrl && !imageFailed ? ' avatar-with-image' : ''}`;

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  if (imageUrl && !imageFailed) {
    return (
      <img
        className={className}
        src={imageUrl}
        alt={`${doctor.fullName || 'Doctor'} profile`}
        loading="lazy"
        onError={() => setImageFailed(true)}
      />
    );
  }

  return <div className={className} aria-label={`${doctor?.fullName || 'Doctor'} profile`}>{doctor?.fullName?.charAt(0) || 'D'}</div>;
}
