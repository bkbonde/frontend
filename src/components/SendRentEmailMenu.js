import { useContext, useState } from 'react';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { CircularProgress } from '@material-ui/core';
import { withTranslation } from '../utils/i18n';
import { StoreContext } from '../store';

const SendRentEmailMenu = withTranslation()(({ t, i18n, tReady, period, tenantIds, onError, ...buttonProps }) => {
  const store = useContext(StoreContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(false);

  const onSend = async docName => {
    setSendingEmail(true);
    handleClose();
    const sendStatus = await store.rent.sendEmail({
      document: docName,
      tenantIds,
      year: period.year(),
      month: period.month() + 1
    });
    setSendingEmail(false);
    if (sendStatus !== 200) {
      // TODO check error code to show a more detail error message
      return onError(t('Email service cannot send emails.'));
    }

    const fetchStatus = await store.rent.fetch();
    if (fetchStatus !== 200) {
      // TODO check error code to show a more detail error message
      return onError(t('Cannot fetch rents from server'));
    }
  }

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = async (docName) => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        aria-controls="rent-by-email-menu"
        aria-haspopup="true"
        endIcon={sendingEmail ? <CircularProgress color="inherit" size={20} /> : null}
        onClick={handleClick}
        {...buttonProps}
      >
        {sendingEmail ? t('Sending') : t('Send email')}
      </Button>
      <Menu
        id="rent-by-email-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={() => onSend('rentcall')}>{t('Send first notice')}</MenuItem>
        <MenuItem onClick={() => onSend('rentcall_reminder')}>{t('Send second notice')}</MenuItem>
        <MenuItem onClick={() => onSend('rentcall_last_reminder')}>{t('Send last notice')}</MenuItem>
        <MenuItem onClick={() => onSend('invoice')}>{t('Send receipt')}</MenuItem>
      </Menu>
    </>
  );
});

export default SendRentEmailMenu;