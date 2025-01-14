import React from 'react';
import styled, { keyframes } from 'styled-components';

// Interfaces for Props
interface SkeletonLoaderProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  count?: number;
  className?: string;
}

// Skeleton Loader Component
export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = '100vh',
  borderRadius = '0.25rem',
  count = 1,
  className = ''
}) => {
  return (
    <>
      {[...Array(count)].map((_, index) => (
        <SkeletonWrapper 
          key={index}
          width={width}
          height={height}
          borderRadius={borderRadius}
          className={className}
        />
      ))}
    </>
  );
};

// Styled Components for Animation
const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

interface SkeletonWrapperProps {
  width: string;
  height: string;
  borderRadius: string;
}

const SkeletonWrapper = styled.div<SkeletonWrapperProps>`
  width: ${props => props.width};
  height: ${props => props.height};
  border-radius: ${props => props.borderRadius};
  background: linear-gradient(
    to right, 
    #f0f0f0 8%, 
    #e0e0e0 18%, 
    #f0f0f0 33%
  );
  background-size: 1000px 100%;
  animation: ${shimmer} 4s infinite cubic-bezier(0.645, 0.045, 0.355, 1);
`;