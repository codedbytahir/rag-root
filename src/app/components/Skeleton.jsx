'use client';

import React from 'react';

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-white/5 rounded ${className}`} />
);

export default Skeleton;
