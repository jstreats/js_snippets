
To add an SSL certificate to `windows_exporter` and expose Windows metrics to Prometheus using a `.pem` file and a passphrase, follow these steps: 
1. **Convert the `.pem` file to a `.pfx` file** :
The `.pem` file needs to be converted to a `.pfx` file since Windows services like `windows_exporter` generally use `.pfx` format. You can use OpenSSL to do this.
Open a command prompt or PowerShell and run the following command:


```sh
openssl pkcs12 -export -out cert.pfx -inkey your_key.pem -in your_cert.pem -passout pass:your_passphrase
```
 
2. **Import the `.pfx` file to the Windows certificate store** :
Once you have the `.pfx` file, you need to import it into the Windows certificate store. 
  - Open the Certificate Manager by running `certmgr.msc` from the Run dialog (`Win + R`).
 
  - Navigate to `Personal > Certificates`.
 
  - Right-click and choose `All Tasks > Import`.
 
  - Follow the wizard to import the `.pfx` file. Ensure you place it in the `Personal` certificate store.
 
3. **Configure `windows_exporter` to use the certificate** :
You need to configure `windows_exporter` to use the imported certificate. 
  - Open the `windows_exporter` configuration file, typically named `windows_exporter.yml` or similar.
 
  - Add the following configuration to use HTTPS and specify the certificate thumbprint:


```yaml
tls_server_config:
  cert_file: "C:\\Path\\To\\cert.pfx"
  key_file: "C:\\Path\\To\\cert.pfx"
  key_password: "your_passphrase"
```
Alternatively, if the `windows_exporter` directly supports specifying the certificate from the store:

```yaml
tls_server_config:
  cert_store: "MY"
  cert_thumbprint: "YOUR_CERT_THUMBPRINT"
```
 
  - To find the certificate thumbprint, go back to the Certificate Manager, right-click on the imported certificate, select `Open`, go to the `Details` tab, and find the `Thumbprint` field. Copy the thumbprint value.
 
4. **Restart the `windows_exporter` service** :
After making these changes, restart the `windows_exporter` service for the changes to take effect. You can do this through the Services manager (`services.msc`) or by running the following command in an elevated command prompt:

```sh
net stop windows_exporter
net start windows_exporter
```
 
5. **Update Prometheus configuration** :
Ensure that Prometheus is configured to scrape metrics from the `windows_exporter` using HTTPS. Update your Prometheus configuration file (`prometheus.yml`) as follows:

```yaml
scrape_configs:
  - job_name: 'windows'
    scheme: https
    tls_config:
      ca_file: /path/to/ca.pem
    static_configs:
      - targets: ['your_windows_exporter_host:9182']
```
By following these steps, you should be able to secure `windows_exporter` with SSL and expose Windows metrics to Prometheus securely.

You: 

Where should I make changes to the file?

ChatGPT: 

To configure `windows_exporter` with SSL, you need to update the `windows_exporter` configuration file and potentially add additional parameters to the service startup command. Here’s a step-by-step guide: 
1. **Convert `.pem` to `.pfx`** :
Make sure you have OpenSSL installed. Run the following command in your terminal to convert your `.pem` file to `.pfx`:

```sh
openssl pkcs12 -export -out cert.pfx -inkey your_key.pem -in your_cert.pem -passout pass:your_passphrase
```
 
2. **Import the `.pfx` file to the Windows certificate store** : 
  - Open the Certificate Manager by running `certmgr.msc` from the Run dialog (`Win + R`).
 
  - Navigate to `Personal > Certificates`.
 
  - Right-click and choose `All Tasks > Import`.
 
  - Follow the wizard to import the `.pfx` file. Ensure you place it in the `Personal` certificate store.
 
3. **Locate and Edit the `windows_exporter` Configuration** :
If `windows_exporter` is running as a service, you may need to edit the service configuration. Typically, this involves modifying the service startup parameters.**Using Command Line Arguments** : 
  - Open `services.msc` and locate the `windows_exporter` service.
 
  - Right-click the service, select `Properties`, and go to the `General` tab.
 
  - Note the `Path to executable` value. This usually looks something like:

```makefile
C:\Program Files\windows_exporter\windows_exporter.exe
```

Modify this path to include the SSL certificate parameters:


```sh
"C:\Program Files\windows_exporter\windows_exporter.exe" --web.config.file="C:\Program Files\windows_exporter\windows_exporter.yml"
```
**Modify the Configuration File** :
Create or modify the configuration file (`windows_exporter.yml`) to include the SSL configuration. Place this file in the same directory as the `windows_exporter.exe` or any directory of your choice and ensure the path is correctly referenced in the service startup parameters.Example `windows_exporter.yml`:

```yaml
tls_server_config:
  cert_file: "C:\\Path\\To\\cert.pfx"
  key_file: "C:\\Path\\To\\cert.pfx"
  key_password: "your_passphrase"
```
 
4. **Restart the `windows_exporter` Service** :
After updating the service configuration: 
  - Open an elevated command prompt and run:

```sh
net stop windows_exporter
net start windows_exporter
```
 
5. **Update Prometheus Configuration** :
Update your `prometheus.yml` to scrape metrics using HTTPS:

```yaml
scrape_configs:
  - job_name: 'windows'
    scheme: https
    tls_config:
      ca_file: /path/to/ca.pem
    static_configs:
      - targets: ['your_windows_exporter_host:9182']
```
Ensure Prometheus can access the CA file that signed the `.pfx` certificate.
By following these steps, you will have configured `windows_exporter` to use SSL, exposing Windows metrics to Prometheus securely.
