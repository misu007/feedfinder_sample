# Chatter検索ツール　サンプルコード

本リポジトリはSalesforce上で動作するChatter検索ツールを作成するためのAPEX/Visualforceサンプルコードです。正常動作させるためには、
本リポジトリ内に含まれるApexクラス、Visualforceページ、Visualforceコンポーネント、静的リソースなどのメタデータ以外に、カスタムオブジェクト、カスタム設定、外部接続アプリケーションを作成し、カスタム設定にパラメータ値を設定する必要がございます。


### カスタムオブジェクト

#### Tag__c

項目:  
ContentsCount__c　・・・　Roll-Up Summary (COUNT TagContent)  
UserId__c　・・・　Text(100)  


#### TagContent__c

項目:  
FeedId__c　・・・　Text(100)  
Tag__c　・・・　Master-Detail(Tag)  
UserId__c　・・・　Text(100)  


### カスタム設定

#### FeedFinderAppSetting__c

Type : Hierarchy  
項目:  
cKey__c　・・・　Text(255)  
FQDN__c　・・・　Text(255)  
GA_UA__c　・・・　Text(255)  
infoURL__c　・・・　Text(255)  
loginURL__c　・・・　Text(255)  
orgURL__c　・・・　Text(255)  
rURL__c　・・・　Text(255)  
SaltForGaUserID__c　・・・　Text(255)  
secret8chars__c　・・・　Text(8)  

