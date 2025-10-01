import { teal } from "@mui/material/colors";

// Dashboard/dark theme colors
const darkBg = "#0d0d0d";
const darkGradient = 'linear-gradient(to bottom, #121212, #0d0d0d)';
const sidebarBg = darkGradient;
const sidebarBorder = '#18191a';
const mainBg = "#121212";
const skeletonBg = "#131a18ff";

const DashboardSkeleton = () => {
    return (
      <div style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "stretch",
        justifyContent: "center",
        height: "100vh",
        width: "100vw",
        background: mainBg,
        gap: 0
      }}>
        {/* Sidebar skeleton */}
        <div style={{
          width: "20%",
          minWidth: 180,
          background: sidebarBg,
          borderRight: `1.5px solid ${sidebarBorder}`,
          display: "flex",
          flexDirection: "column",
          padding: "4em 0",
          gap: "0.5em"
        }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{
              width: "60%",
              height: 38,
              background: skeletonBg,
              margin: "0.5em auto",
              borderRadius: "8px"
            }} />
          ))}
        </div>
        {/* Main content skeleton */}
        <div style={{
          flex: 1,
          background: darkGradient,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "3em 0",
          overflow: "auto"
        }}>
          {/* search bar skeleton */}
          <div style={{
            width: "90%",
            height: 44,
            background: skeletonBg,
            borderRadius: "10px",
            marginBottom: "2em"
          }} />
          {/* Cards skeleton */}
          <div style={{
            display: "flex",
            gap: "2em",
            width: "90%",
            justifyContent: "center",
            marginBottom: "2em"
          }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{
                width: 320,
                height: 260,
                background: skeletonBg,
                borderRadius: "18px",
                boxShadow: "0 4px 24px 0 #0002"
              }} />
            ))}
          </div>
          {/* Table/news skeleton */}
          <div style={{
            width: "90%",
            height: 360,
            background: skeletonBg,
            borderRadius: "14px",
            marginBottom: "2em"
          }} />
        </div>
        {/* Right sidebar skeleton */}
        <div style={{
          width: "20%",
          minWidth: 180,
          background: sidebarBg,
          borderLeft: `1.5px solid ${sidebarBorder}`,
        }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{
              width: "80%",
              height: 100,
              background: skeletonBg,
              margin: "0.5em auto",
              borderRadius: "8px",
              border: `1.5px solid ${sidebarBorder}`,
            }} />
          ))}
        </div>
      </div>
    );
}

export default DashboardSkeleton;