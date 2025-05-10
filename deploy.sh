#!/bin/bash
FILE_LOG="/home/ubuntu/logs/deploy_backend.log"

# clear log
echo "" >> $FILE_LOG

# check if OCI CLI is installed
if ! command -v oci &> /dev/null; then
    echo "OCI CLI not found. Installing..." >> $FILE_LOG
    curl -sL https://raw.githubusercontent.com/oracle/oci-cli/master/scripts/install/install.sh | bash -s -- --accept-all-defaults >> $FILE_LOG 2>&1

    # load oci into PATH for current session (adjust path if needed)
    export PATH=$HOME/bin:$PATH
    echo 'export PATH=$HOME/bin:$PATH' >> ~/.bashrc
    source ~/.bashrc
else
    echo "OCI CLI already installed." >> $FILE_LOG
fi

# check if OCI is configured
if [ ! -f "$OCI_CONFIG_FILE" ]; then
    echo "OCI CLI not configured. Starting configuration..." >> $FILE_LOG

    # Usar configuración automática desde archivo
    mkdir -p ~/.oci
    cp /home/ubuntu/oci_config_template/config ~/.oci/config
    cp /home/ubuntu/oci_config_template/soporte.pem ~/.oci/soporte.pem
    cp /home/ubuntu/oci_config_template/miguel.yudex.pem ~/.oci/miguel.yudex.pem
    chmod 600 ~/.oci/soporte.pem
    chmod 600 ~/.oci/miguel.yudex.pem
    echo "OCI configuration applied." >> $FILE_LOG
else
    echo "OCI CLI already configured." >> $FILE_LOG
fi

# install dependencies
echo "Installing dependencies..." >> $FILE_LOG
npm install --force --silent

# build
echo "Building..." >> $FILE_LOG
npm run build

# deploy
echo "Deploying..." >> $FILE_LOG
if pm2 list | grep -q 'online'; then #verifica si hay un servicio corriendo
    pm2 reload ecosystem.config.js --env prod
else
    npm run deploy:prod
fi

# success
echo "Deployment successful!" >> $FILE_LOG