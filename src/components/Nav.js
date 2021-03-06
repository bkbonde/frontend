import { useEffect, useState, useRef, useContext } from 'react';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import DashboardIcon from '@material-ui/icons/Dashboard';
import ReceiptIcon from '@material-ui/icons/Receipt';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import PeopleIcon from '@material-ui/icons/People';
import SettingsIcon from '@material-ui/icons/Settings';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';

import { useStyles } from '../styles/components/Nav.styles';
import { withTranslation } from '../utils/i18n';
import { ListItemIcon } from '@material-ui/core';
import { StoreContext } from '../store';
import { useRouter } from 'next/router';

const Nav = withTranslation()((props) => {
    const { t } = props;
    const classes = useStyles();
    const [open, setOpen] = useState(false);
    const [openDebounced, setOpenDebounced] = useState(false);
    const timerRef = useRef();
    const store = useContext(StoreContext);

    const router = useRouter();
    const { pathname, query: { organization } } = router;

    const menuItems = [
        {
            key: 'dashboard',
            value: t('Dashboard'),
            pathname: '/dashboard',
            icon: <DashboardIcon />,
        },
        {
            key: 'rents',
            value: t('Rents'),
            pathname: '/rents/[yearMonth]',
            icon: <ReceiptIcon />,
        },
        {
            key: 'tenants',
            value: t('Tenants'),
            pathname: '/tenants',
            icon: <PeopleIcon />
        },
        {
            key: 'estates',
            value: t('Estates'),
            pathname: '/estates',
            icon: <VpnKeyIcon />
        },
        {
            key: 'accounting',
            value: t('Accounting'),
            pathname: '/accounting',
            icon: <AccountBalanceWalletIcon />
        },
        {
            key: 'settings',
            value: t('Settings'),
            pathname: '/settings',
            icon: <SettingsIcon />
        }
    ];

    useEffect(() => {
        timerRef.current = setTimeout(() => setOpenDebounced(open), 1000);
        return () => timerRef.current && clearTimeout(timerRef.current);
    }, [open]);


    const handleMenuClick = menuItem => {
        timerRef.current && clearTimeout(timerRef.current);
        const pathname = menuItem.pathname.replace('[yearMonth]', store.rent.period);
        router.push(`/${organization}${pathname}`);
    };

    return (
        <Drawer
            className={`${openDebounced ? classes.drawerOpen : classes.drawerClose}`}
            variant="permanent"
            classes={{ paper: openDebounced ? classes.drawerOpen : classes.drawerClose }}
        >
            <List className={classes.list}>
                {menuItems.map(item => {
                    const isSelected = pathname.indexOf(item.pathname) !== -1;
                    return (
                        <ListItem
                            className={`${classes.item} ${isSelected ? classes.itemSelected : ''}`}
                            button
                            key={item.key}
                            selected={isSelected}
                            onClick={() => handleMenuClick(item)}
                            onMouseOver={() => setOpen(true)}
                            onMouseOut={() => setOpen(false)}
                        >
                            <ListItemIcon classes={{root: classes.itemIcon}}>{item.icon}</ListItemIcon>
                            <ListItemText
                                className={`${classes.itemText} ${openDebounced ? classes.itemTextOpen : classes.itemTextClose}`}
                                primary={item.value}
                            />
                        </ListItem>
                    );
                })}
            </List>
        </Drawer>
    );
});

export default Nav;