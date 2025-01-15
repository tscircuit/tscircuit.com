import React from "react";
import styled, { keyframes } from "styled-components";

const FullPageSkeletonLoader: React.FC = () => {
  return (
    <PageWrapper>
      {/* Navigation Skeleton */}
      <NavSkeleton>
        <LogoPlaceholder />
        <NavItems>
          {[...Array(4)].map((_, index) => (
            <NavItem key={index} />
          ))}
        </NavItems>
        <ActionButtons>
          <ActionPlaceholder width="80px" />
          <ActionPlaceholder width="120px" />
        </ActionButtons>
      </NavSkeleton>

      {/* Mid Content Skeleton */}
      <ContentSkeleton>
        <MainContent>
          {/* Initial lines with different lengths */}
          {[...Array(3)].map((_, index) => (
            <HorizontalLine 
              key={`line-top-${index}`} 
              style={{ width: `${Math.floor(Math.random() * (90 - 70 + 1) + 70)}%` }} 
            />
          ))}

          {/* Two horizontal boxes */}
          <BoxContainer>
            <Box />
            <Box />
          </BoxContainer>

          {/* Additional lines with varying lengths */}
          {[...Array(5)].map((_, index) => (
            <HorizontalLine 
              key={`line-bottom-${index}`} 
              style={{ width: `${Math.floor(Math.random() * (80 - 50 + 1) + 50)}%` }} 
            />
          ))}
        </MainContent>
        <Sidebar>
          {[...Array(5)].map((_, index) => (
            <SidebarBlock key={index} />
          ))}
        </Sidebar>
      </ContentSkeleton>
    </PageWrapper>
  );
};

// Shimmer animation for skeleton
const shimmer = keyframes`
  0% {
    background-position: -150%;
  }
  100% {
    background-position: 150%;
  }
`;

// Styled Skeleton Components
const SkeletonBase = styled.div`
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite ease-in-out;
  border-radius: 8px;
`;

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100vh; /* Full screen height */
  padding: 0;
  margin: 0;
`;

const NavSkeleton = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: #ffffff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
`;

const LogoPlaceholder = styled(SkeletonBase)`
  width: 100px;
  height: 40px;
  border-radius: 4px;
`;

const NavItems = styled.div`
  display: flex;
  gap: 16px;
`;

const NavItem = styled(SkeletonBase)`
  width: 80px;
  height: 20px;
  border-radius: 4px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const ActionPlaceholder = styled(SkeletonBase)<{ width: string }>`
  width: ${(props) => props.width};
  height: 40px;
  border-radius: 8px;
`;

const ContentSkeleton = styled.div`
  flex: 1; /* Fills remaining space dynamically */
  display: flex;
  flex-direction: row;
  gap: 24px; /* Space between content and sidebar */
  padding: 20px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  overflow-y: auto; /* Allows scrolling if content overflows */
`;

const MainContent = styled.div`
  flex: 3; /* Takes up most of the width */
  display: flex;
  flex-direction: column;
  gap: 24px; /* Space between lines */
`;

const BoxContainer = styled.div`
  display: flex;
  gap: 16px; /* Space between boxes */
`;

const Box = styled(SkeletonBase)`
  flex: 1; /* Equal width for both boxes */
  height: 120px;
  border-radius: 8px;
`;

const Sidebar = styled.div`
  flex: 1; /* Smaller width for the sidebar */
  display: flex;
  flex-direction: column;
  gap: 16px; /* Space between blocks */
`;

const HorizontalLine = styled(SkeletonBase)`
  width: 100%;
  height: 16px;
  border-radius: 8px;
`;

const SidebarBlock = styled(SkeletonBase)`
  width: 100%;
  height: 80px;
  border-radius: 8px;
`;

export default FullPageSkeletonLoader;
