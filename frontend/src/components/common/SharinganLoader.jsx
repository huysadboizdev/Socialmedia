import React from 'react';

export default function SharinganLoader({ size = 120 }) {
  return (
    <div
      className="sharingan"
      style={{ width: size, height: size }}
    >
      <div className="tomoe t1" />
      <div className="tomoe t2" />
      <div className="tomoe t3" />
      <div className="center" />
    </div>
  )
}
