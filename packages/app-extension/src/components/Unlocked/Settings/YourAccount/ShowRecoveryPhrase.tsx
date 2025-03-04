import { useEffect, useState, FormEvent } from "react";
import { Box, List, ListItem, ListItemIcon } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ChatIcon from "@mui/icons-material/Chat";
import WebIcon from "@mui/icons-material/Web";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { UI_RPC_METHOD_KEYRING_EXPORT_MNEMONIC } from "@coral-xyz/common";
import {
  CopyButton,
  MnemonicInputFields,
} from "../../../common/Account/MnemonicInput";
import {
  DangerButton,
  Header,
  HeaderIcon,
  SecondaryButton,
  SubtextParagraph,
  TextField,
} from "../../../common";
import { EyeIcon, WarningIcon } from "../../../common/Icon";
import { useNavStack } from "../../../common/Layout/NavStack";
import { useDrawerContext } from "../../../common/Layout/Drawer";

const useStyles = styles((theme: any) => ({
  passwordField: {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        border: `${theme.custom.colors.borderFull}`,
      },
      "&:hover fieldset": {
        border: `solid 2pt ${theme.custom.colors.primaryButton}`,
      },
    },
  },
  listRoot: {
    color: theme.custom.colors.fontColor,
    padding: "0",
    margin: "0 8px",
    borderRadius: "4px",
    fontSize: "14px",
  },
  listItemRoot: {
    border: `${theme.custom.colors.borderFull}`,
    alignItems: "start",
    borderRadius: "4px",
    background: theme.custom.colors.nav,
    padding: "8px",
    minHeight: "56px",
    marginBottom: "1px",
  },
  listItemIconRoot: {
    minWidth: "inherit",
    height: "20px",
    width: "20px",
    marginRight: "8px",
  },
}));

export function ShowRecoveryPhraseWarning() {
  const classes = useStyles();
  const background = useBackgroundClient();
  const nav = useNavStack();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    const navButton = nav.navButtonRight;
    nav.setTitle("Secret recovery phrase");
    return () => {
      nav.setNavButtonRight(navButton);
    };
  }, []);

  const next = async (e: FormEvent) => {
    e.preventDefault();

    let mnemonic;
    try {
      mnemonic = await background.request({
        method: UI_RPC_METHOD_KEYRING_EXPORT_MNEMONIC,
        params: [password],
      });
    } catch (e) {
      console.error(e);
      setError(true);
      return;
    }
    nav.push("show-secret-phrase", { mnemonic });
  };

  return (
    <form
      noValidate
      onSubmit={next}
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
      }}
    >
      <Box sx={{ margin: "32px 24px 0 24px" }}>
        <HeaderIcon
          style={{ width: "40px", height: "40px", marginBottom: "24px" }}
          icon={<WarningIcon fill="#E95050" width="40px" height="40px" />}
        />
        <Header text="Warning" style={{ textAlign: "center" }} />
        <Box sx={{ marginTop: "24px" }}>
          <List className={classes.listRoot}>
            <ListItem className={classes.listItemRoot}>
              <ListItemIcon className={classes.listItemIconRoot}>
                <ChatIcon
                  htmlColor="#EF4444"
                  style={{
                    height: "20px",
                    width: "20px",
                  }}
                />
              </ListItemIcon>
              Backpack support will never ask for your secret phrase.
            </ListItem>
            <ListItem className={classes.listItemRoot}>
              <ListItemIcon className={classes.listItemIconRoot}>
                <WebIcon
                  htmlColor="#EF4444"
                  style={{
                    height: "20px",
                    width: "20px",
                  }}
                />
              </ListItemIcon>
              Never share your secret phrase or enter it into an app or website.
            </ListItem>
            <ListItem className={classes.listItemRoot}>
              <ListItemIcon className={classes.listItemIconRoot}>
                <LockOpenIcon
                  htmlColor="#EF4444"
                  style={{ height: "20px", width: "20px" }}
                />
              </ListItemIcon>
              Anyone with your secret phrase will have complete control of your
              account.
            </ListItem>
          </List>
        </Box>
      </Box>
      <Box
        sx={{
          marginLeft: "16px",
          marginRight: "16px",
          marginBottom: "16px",
        }}
      >
        <Box sx={{ marginBottom: "8px" }}>
          <TextField
            autoFocus={true}
            isError={error}
            inputProps={{ name: "password" }}
            placeholder="Password"
            type="password"
            value={password}
            setValue={setPassword}
            rootClass={classes.passwordField}
          />
        </Box>
        <DangerButton
          label="Show phrase"
          type="submit"
          disabled={password.length === 0}
        />
      </Box>
    </form>
  );
}

export function ShowRecoveryPhrase({ mnemonic }: { mnemonic: string }) {
  const theme = useCustomTheme();
  const classes = useStyles();
  const { close } = useDrawerContext();
  const mnemonicWords = mnemonic.split(" ");

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
      }}
    >
      <Box sx={{ margin: "32px 16px 0 16px" }}>
        <HeaderIcon
          icon={<EyeIcon />}
          style={{ width: "40px", height: "40px", marginBottom: "24px" }}
        />
        <Header text="Recovery phrase" style={{ textAlign: "center" }} />
        <SubtextParagraph style={{ textAlign: "center", fontSize: "14px" }}>
          Use these {mnemonicWords.length} words to recover your wallet
        </SubtextParagraph>
        <MnemonicInputFields
          mnemonicWords={mnemonicWords}
          rootClass={classes.mnemonicInputRoot}
        />
        <Box sx={{ marginTop: "4px" }}>
          <CopyButton
            text={mnemonic}
            icon={
              <ContentCopyIcon
                style={{ color: theme.custom.colors.fontColor }}
              />
            }
          />
        </Box>
      </Box>
      <Box
        sx={{
          marginLeft: "16px",
          marginRight: "16px",
          marginBottom: "16px",
        }}
      >
        <SecondaryButton label="Close" onClick={() => close()} />
      </Box>
    </Box>
  );
}
