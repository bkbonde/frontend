import _ from 'lodash';
import moment from 'moment';
import { useContext } from 'react';
import { useObserver } from 'mobx-react-lite'
import { Avatar, Box, Chip, Grid, Hidden, List, ListItem, ListItemAvatar, ListItemText, makeStyles, Paper, Typography } from '@material-ui/core'
import OfficeIcon from '@material-ui/icons/HomeWork';
import ParkingIcon from '@material-ui/icons/LocalParking';
import MailboxIcon from '@material-ui/icons/MarkunreadMailbox';

import { withAuthentication } from '../../../components/Authentication'
import Page from '../../../components/Page'
import { withTranslation } from '../../../utils/i18n';
import { getStoreInstance, StoreContext } from '../../../store';
import { isServer } from '../../../utils';
import SearchFilterBar from '../../../components/SearchFilterBar';


const useStyles = makeStyles((theme) => ({
  inProgress: {
    backgroundColor: theme.palette.success.main
  },
}));

const Properties = ({ tenant }) => {
  return (
    <Box display="flex" height="100%" alignItems="center" flexWrap="wrap">
      {tenant.properties.map(({ property }, index) => {
        let Icon = OfficeIcon;
        switch (property.type) {
          case 'office':
            Icon = OfficeIcon;
            break;
          case 'parking':
            Icon = ParkingIcon;
            break;
          case 'letterbox':
            Icon = MailboxIcon;
            break;
          default:
            Icon = OfficeIcon;
            break;
        }

        return (
          <Box key={index} m={0.5}>
            <Chip
              icon={<Icon />}
              label={property.name}
              variant="outlined"
            />
          </Box>
        );
      })}
    </Box>

  );
}

const TenantList = withTranslation()(({ t }) => {
  const store = useContext(StoreContext);
  const classes = useStyles();

  return useObserver(() => (
    <List
      component="nav"
      aria-labelledby="tenant-list"
    >
      {store.tenant.filteredItems.map(tenant => {
        const avatar = tenant.name
          .split(' ')
          .reduce((acc, w, index) => {
            if (index < 2) {
              acc.push(w);
            }
            return acc;
          }, [])
          .filter(n => !!n)
          .map(n => n[0])
          .join('');

        return (
          <Paper key={tenant._id}>
            <ListItem button style={{
              marginBottom: 20
            }}>
              <Hidden smDown>
                <ListItemAvatar>
                  <Avatar className={!tenant.terminated ? classes.inProgress : null}>{avatar}</Avatar>
                </ListItemAvatar>
              </Hidden>
              <ListItemText
                primary={
                  <Grid container spacing={1}>
                    <Grid item xs={12} md={4}>
                      <Typography variant="h5">
                        {tenant.name}
                      </Typography>
                      {tenant.isCompany && (
                        <Typography
                          color="textSecondary"
                        >
                          {_.startCase(_.capitalize(tenant.manager))}
                        </Typography>
                      )}
                      <Typography
                        color="textSecondary"
                      >
                        {t('Contract {{contract}}', { contract: tenant.contract })}
                      </Typography>
                      <Typography
                        color="textSecondary"
                      >
                        {t('From {{startDate}} to {{endDate}}', {
                          startDate: moment(tenant.beginDate, 'DD/MM/YYYY').format('L'),
                          endDate: moment(tenant.terminated ? tenant.terminationDate : tenant.endDate, 'DD/MM/YYYY').format('L')
                        })}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={8}>
                      <Properties tenant={tenant} />
                    </Grid>
                  </Grid>
                }
              />
            </ListItem>
          </Paper>
        )
      })}
    </List>
  ));
});

const Tenants = withTranslation()(({ t }) => {
  const store = useContext(StoreContext);

  const onSearch = (status, searchText) => {
    store.tenant.setFilters({ status, searchText });
  };

  return useObserver(() => (
    <Page
      PrimaryToolbar={
        <Typography color="textSecondary" variant="h5" noWrap>
          {t('Tenants')}
        </Typography>
      }
      SecondaryToolbar={
        <SearchFilterBar
          filters={[
            { id: '', label: t('All') },
            { id: 'inprogress', label: t('In progress') },
            { id: 'stopped', label: t('Terminated') },

          ]}
          defaultValue={store.tenant.filters}
          onSearch={onSearch}
        />
      }
    >
      <TenantList />
    </Page>
  ))
});

Tenants.getInitialProps = async (context) => {
  console.log('Tenants.getInitialProps')
  const store = isServer() ? context.store : getStoreInstance();

  const fetchStatus = await store.tenant.fetch();
  if (fetchStatus !== 200) {
    // TODO check error code to show a more detail error message
    return { error: { statusCode: 500 } };
  }

  return {
    initialState: {
      store: JSON.parse(JSON.stringify(store))
    }
  };
};

export default withAuthentication(Tenants);
