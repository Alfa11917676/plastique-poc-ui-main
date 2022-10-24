import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { AppProps } from "next/app";
import { RecoilRoot } from "recoil";
import "../styles/global.css";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const MyApp = ({ Component, pageProps }: AppProps) => (
  <RecoilRoot>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      {/* @ts-ignore */}
      <Component {...pageProps} />
    </ThemeProvider>
  </RecoilRoot>
);

export default MyApp;
