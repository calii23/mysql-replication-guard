# MySQL replication guard

This tool can be used to verify the integrity of a MySQL replication. There is a command to set up the replication.
After the replication is set up, it can be verified that the content of the tables are equivalent on both sides.

## Installation

```bash
npm install -g mysql-replication-guard
```

or with yarn:

```bash
yarn global add mysql-replication-guard
```

## Config file

A config file must be created. It can look like that for instance:

```json
{
  "master": {
    "host": "master-host",
    "user": "replication_guard",
    "password": "<some password>"
  },
  "slave": {
    "host": "slave-host",
    "user": "replication_guard",
    "password": "<some password>"
  },
  "slaveMasterConnection": {
    "host": "master-host",
    "user": "slave_user",
    "password": "<some password>"
  },
  "databaseName": "<db name>",
  "tables": "all",
  "replicationChannel": "production",
  "mysqlTool": "/usr/bin/mysql",
  "dumpTool": "/usr/bin/mysqldump",
  "mail": {
    "smtp": {
      "host": "smtp.example.com",
      "auth": {
        "user": "system@example.com",
        "pass": "<some password>"
      },
      "port": 587
    },
    "to": {
      "address": "admin@example.com",
      "name": "Admin"
    },
    "from": {
      "address": "system@example.com",
      "name": "MySQL replication guard"
    },
    "subject": "MySQL replication guard event"
  }
}
```

Details about the schema of the config file can be found in `dist/config/schema.json`.

### Mail

A `mail` property can be provided optionally. When provided, an E-Mail will be send with the given configuration when an
error occurs, or a data inconsistency was detected (even if it could be fixed).

The property can be omitted, in that case no E-Mails will be sent at all.

## MySQL Permission

The script needs the following permissions to the database:

### Master

```sql
CREATE USER replication_guard@localhost IDENTIFIED BY '<some password>';
GRANT SELECT, LOCK TABLES ON database.* TO replication_guard@localhost;
GRANT SUPER, RELOAD ON *.* TO replication_guard@localhost;
```

### Slave

```sql
CREATE USER replication_guard@localhost IDENTIFIED BY '<some password>';
GRANT RELOAD, SUPER ON *.* TO replication_guard@localhost;
GRANT SELECT, INSERT, DROP, CREATE, ALTER, REFERENCES, LOCK TABLES ON database.* TO replication_guard@localhost;
```

## Usage

There are 3 command which can be used:

### Setup

```bash
mysql-replication-guard --config config.json setup
```

This command will set up the replication. To do so, the following commands will be executed:

```sql
/* MASTER */ RESET MASTER;
/* SLAVE */  STOP SLAVE FOR CHANNEL ?;
/* SLAVE */  RESET SLAVE FOR CHANNEL ?;

# All tables will be copied from master to slave (might override existing data in the slave)

/* SLAVE */  CHANGE MASTER TO /* data from slaveMasterConnection */ FOR CHANNEL ?; 
/* SLAVE */  START SLAVE FOR CHANNEL ?;
```

When the database is copied from the master to slave, **all** tables are copied, not only the tables which are
configured.

### Verify

```bash
mysql-replication-guard --config config.json verify
```

This command will create checksums over all configured tables in both databases. If they are different, a dump will be
created on the master for the broken tables and transferred to the slave. This should normally fix the issue.
Nevertheless, the script verifies all tables again after fixing, and reports errors when there are still tables with
different checksums.

It is intended that this command is executed every once in a while. This could be done using a crontab. To install a
crontab which verified the database every day at 3am you could use this configuration:

```
0 3 * * * /usr/bin/mysql-replication-guard -c /root/mysql-replication-guard/config.json verify &> /root/mysql-replication-guard/guard.log
```

### Notify

```bash
mysql-replication-guard --config config.json notify "Something happened"
```

This command will simply send an E-Mail with a custom text. It is just for other services to notify about something
happened. This command will only work, if a mail configuration is given. Otherwise, it will print an error and abort
with a non-zero exit code.

## License

Just use it, I do not care. (MIT)
