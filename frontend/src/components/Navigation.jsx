import { NavLink } from "react-router-dom";
import styled from "styled-components";
import HomeIcon from "./icons/HomeIcon";
import MissionIcon from "./icons/MissionIcon";
import ProfileIcon from "./icons/ProfileIcon";

const NavContainer = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #ffffff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  padding-bottom: env(safe-area-inset-bottom);
`;

const NavContent = styled.div`
  max-width: 480px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  padding: 4px 0;
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px;
  color: #757575;
  transition: all 0.15s ease;
  text-decoration: none;

  &.active {
    color: #3a6ea5;

    .nav-icon {
      transform: scale(1.1);
    }
  }

  &:active {
    transform: scale(0.95);
  }
`;

const NavIcon = styled.div`
  font-size: 1.5rem;
  margin-bottom: 4px;
  transition: transform 0.15s ease;
`;

const NavLabel = styled.span`
  font-size: 12px;
  font-weight: 500;
`;

const navItems = [
  { path: "/", icon: HomeIcon, label: "홈" },
  { path: "/mission", icon: MissionIcon, label: "미션" },
  { path: "/profile", icon: ProfileIcon, label: "프로필" },
];

function Navigation() {
  return (
    <NavContainer>
      <NavContent>
        {navItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <StyledNavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
            >
              {({ isActive }) => (
                <>
                  <NavIcon className="nav-icon">
                    <IconComponent
                      color={isActive ? "#3A6EA5" : "#A7A7A7"}
                      size={24}
                    />
                  </NavIcon>
                  <NavLabel>{item.label}</NavLabel>
                </>
              )}
            </StyledNavLink>
          );
        })}
      </NavContent>
    </NavContainer>
  );
}

export default Navigation;
