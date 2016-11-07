using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Azure.Documents;
using Microsoft.Azure.Documents.Client;

namespace PlanningPoker.DocumentsDbDao
{
    public class DocumentDbManager
    {
        private const string EndpointUri = "https://planningpokerddbtest.documents.azure.com:443/";
        private const string PrimaryKey = "Mwtxc2M3cNxnG1rgfvate7dBn4xfOLvakY4B5fiwDPI4uH4gKyw6oyOiniBmzIwgSGMRxwqfnsyXFRAKcnJRDw==";

        private DocumentClient client;
        private string _databaseName = "planningpoker";
        private string _sessionCollectionName = "sessiosn";

        public async Task InitializeDb()
        {
            this.client = new DocumentClient(new Uri(EndpointUri), PrimaryKey);
            await CreateDatabaseIfNotExists(_databaseName);
            await CreateDocumentCollectionIfNotExists(_databaseName, _sessionCollectionName);
        }

        private async Task CreateDatabaseIfNotExists(string databaseName)
        {
            try
            {
                await this.client.ReadDatabaseAsync(UriFactory.CreateDatabaseUri(databaseName));
            }
            catch (DocumentClientException de)
            {
                if (de.StatusCode == HttpStatusCode.NotFound)
                {
                    await this.client.CreateDatabaseAsync(new Database { Id = databaseName });
                }
                else
                {
                    throw;
                }
            }
        }

        private async Task CreateDocumentCollectionIfNotExists(string databaseName, string collectionName)
        {
            try
            {
                await this.client.ReadDocumentCollectionAsync(UriFactory.CreateDocumentCollectionUri(databaseName, collectionName));
            }
            catch (DocumentClientException de)
            {
                if (de.StatusCode == HttpStatusCode.NotFound)
                {
                    DocumentCollection collectionInfo = new DocumentCollection();
                    collectionInfo.Id = collectionName;

                    // Configure collections for maximum query flexibility including string range queries.
                    collectionInfo.IndexingPolicy = new IndexingPolicy(new RangeIndex(DataType.String) { Precision = -1 });

                    // Here we create a collection with 400 RU/s.
                    await this.client.CreateDocumentCollectionAsync(
                        UriFactory.CreateDatabaseUri(databaseName),
                        collectionInfo,
                        new RequestOptions { OfferThroughput = 400 });
                }
                else
                {
                    throw;
                }
            }
        }
    }
}
