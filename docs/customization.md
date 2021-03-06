# Customize your instance

## Ontology data 

RDP relies on a rich set of ontologies to describe taxa, GO terms, organ systems, etc.

This data is retrieved from various remote locations at startup and updated on a monthly basis. To prevent this, 
disable the data cache service:

```ìni
rdp.settings.cache.enabled=false
```

### Loading data from disk

If you choose to load data from the disk or any other location supported by, a location where genes and GO terms can be 
obtained relative to the working directory of the Web application must be provided.

```ini
rdp.settings.cache.load-from-disk=true
rdp.settings.cache.gene-files-location=file:genes/
rdp.settings.cache.ortholog-file=file:DIOPT_filtered_data_March2020.txt
rdp.settings.cache.term-file=file:go.obo
rdp.settings.cache.annotation-file=file:gene2go.gz
rdp.settings.cache.organ-file=file:uberon.obo
```

With the above settings and given that *Homo sapiens* taxon is enabled, RDP will retrieve gene information from 
`genes/Homo_sapiens.gene_info.gz`.

### Taxon

The taxon table is pre-populated during the first migration, and only human is activated and only human is activated. 
To enable other organisms, set their `active` column to `1` in the database. 

For example, the following will activate the mouse taxa:

```sql
update taxon set active = 1 where taxon_id = 10090;
```

### Gene information, GO terms 

By default, RDP will retrieve the latest genes and gene-term associations from
NCBI, and GO terms from [Ontobee](http://www.ontobee.org/ontology/OBI). Users
genes and terms will be updated in the aftermath of a successful update.

Note that the URL used for retrieving data from NCBI is defined in the database. If `rdp.settings.load-from-disk` is 
enabled, the basename of the URL will be used, relative to `rdp.settings.gene-files-location`.

```sql
select taxon_id, scientific_name, gene_url from taxon;
```

### Ortholog mapping

There is a static orthologs mapping included with the application based on [DIOPT](https://bmcbioinformatics.biomedcentral.com/articles/10.1186/1471-2105-12-357), 
that will automatically populate the database on startup. They are also updated monthly.

As an alternative, you can also use NCBI gene orthologs:

```ini
rdp.settings.cache.orthologs-file=ftp://ftp.ncbi.nlm.nih.gov/gene/DATA/gene_orthologs.gz
```

### Organ systems

Organ systems ontology is based on [Uberon multi-species anatomy ontology](http://www.obofoundry.org/ontology/uberon.html) 
and updated monthly.

Only a select few organ systems are active by default. You can activate more by running the following SQL command with
a Uberon identifier of your choice:

```sql
update organ_info set active = true where uberon_id = '<uberon_id>';
```

To disable organ systems altogether, set the following in your configuration:

```
rdp.settings.organs.enabled=false
```

### International data

In order to access the RDMMN shared data system (via the international search), your application must use HTTPS.  If you
do not have HTTPS setup for you domain, you can consult the following guides on how to set it up:

 - [medium.com/@raupach/how-to-install-lets-encrypt-with-tomcat-3db8a469e3d2](https://medium.com/@raupach/how-to-install-lets-encrypt-with-tomcat-3db8a469e3d2)
 - [community.letsencrypt.org/t/configuring-lets-encrypt-with-tomcat-6-x-and-7-x/32416](https://community.letsencrypt.org/t/configuring-lets-encrypt-with-tomcat-6-x-and-7-x/32416)
 
## Tiers

User genes are categorized in tiers corresponding to the level of involvement of a researcher with the gene. Researcher 
have direct access to their TIER1 genes, and a focus on their TIER2 genes. TIER3 genes result from GO term associations.

To enable only TIER1 and TIER2, and thus disabling GO terms-related features, add the following to your configuration:

```
rdp.settings.enabled-tiers=TIER1,TIER2
```

## Researcher categories

Researcher categories can be enabled or disabled by setting the `rdp.settings.profile.enabled-researcher-categories` to
a list of desired values:

```
rdp.settings.enabled-researcher-categories=IN_SILICO,IN_VIVO
```

## Internationalization and custom messages

Some text displayed in RDP can be customized and internationalized.

To do so, create a `messages.properties` file in the working directory of the Web application
add the entries you want to change. Default values are found in
[messages.properties](https://github.com/PavlidisLab/rgr/blob/master/src/main/resources/messages.properties)

You can use suffixed like `messages_en_CA.properties` for region-specific
localization.

Note that `application-prod.properties` and `login.properties` are also used
for messages for backward compatibility. New and existing messages should be
moved to `messages.properties`.

## FAQ

The FAQ can be customized in `faq.properties`.

All the question and answer style items that will display in the frequently asked questions page. Each entry requires 
two parts: `rdp.faq.questions.<q_key>` and `rdp.faq.answers.<q_key>` which hold the question and the corresponding 
answer, respectively.

```
rdp.faq.questions.<q_key>=A relevant question.
rdp.faq.answers.<q_key>=A plausible answer.
```

Example of a FAQ can be found in [faq.properties](https://github.com/PavlidisLab/rgr/blob/master/faq.properties).

## Style and static resources

Static resources can be selectively replaced by including a search directory for Spring static resources.

```ini
spring.resources.static-locations=file:static/,classpath:/static/
```

Here's the list of paths that can be adjusted using the above setting:

```
static/
    css/
        common.css # general pages
        login.css  # login-like pages (i.e. registration, reset password, etc.)
    images/
        model-organisms/
            <taxon_id>.svg
        organs/
            <uberon_id>.svg
        researcher-categories/
            <researcher_category_id>.svg
        brand.png
        favicon-16x16.png
        favicon-32x32.png
        header.jpg
```

We strongly recommend against overriding JavaScript files as it could break functionalities of the website.

## Building from source

You can customize RDP by editing the publicly available source code and
packaging the JAR archive yourself.

```bash
git clone https://github.com/PavlidisLab/rgr.git
cd rgr/
# edit what you want...
./mvnw package
```

The new build will be available in the `target` directory.
