// Built-in datasets so the app is useful the moment it loads. Each is a
// CSV string so it flows through exactly the same pipeline as an upload.

export const SAMPLES = [
  {
    id: 'premier-league',
    name: 'Premier League seasons',
    blurb: 'Goals, wins and points by team across four seasons.',
    csv: `Season,Team,Wins,Draws,Losses,Goals,Points
2020/21,Manchester City,27,5,6,83,86
2020/21,Manchester United,21,11,6,73,74
2020/21,Liverpool,20,9,9,68,69
2020/21,Chelsea,19,10,9,58,67
2020/21,Arsenal,18,7,13,55,61
2021/22,Manchester City,29,6,3,99,93
2021/22,Liverpool,28,8,2,94,92
2021/22,Chelsea,21,11,6,76,74
2021/22,Manchester United,16,10,12,57,58
2021/22,Arsenal,22,3,13,61,69
2022/23,Manchester City,28,5,5,94,89
2022/23,Arsenal,26,6,6,88,84
2022/23,Manchester United,23,6,9,58,75
2022/23,Liverpool,19,10,9,75,67
2022/23,Chelsea,11,11,16,38,44
2023/24,Manchester City,28,7,3,96,91
2023/24,Arsenal,28,5,5,91,89
2023/24,Liverpool,24,10,4,86,82
2023/24,Chelsea,18,9,11,77,63
2023/24,Manchester United,18,6,14,57,60`,
  },
  {
    id: 'world-population',
    name: 'World population',
    blurb: 'Population and GDP per capita for major countries by year.',
    csv: `Year,Country,Region,Population,GDP per capita
2000,China,Asia,1262645000,959
2000,India,Asia,1059634000,443
2000,United States,Americas,282162411,36330
2000,Brazil,Americas,175287587,3749
2000,Nigeria,Africa,122851984,568
2000,Germany,Europe,82211508,23636
2010,China,Asia,1337705000,4550
2010,India,Asia,1234281000,1358
2010,United States,Americas,309321666,48467
2010,Brazil,Americas,196796269,11286
2010,Nigeria,Africa,158503197,2292
2010,Germany,Europe,81776930,41786
2020,China,Asia,1411100000,10500
2020,India,Asia,1396387127,1913
2020,United States,Americas,331501080,63528
2020,Brazil,Americas,213196304,6797
2020,Nigeria,Africa,208327405,2097
2020,Germany,Europe,83160871,46208`,
  },
  {
    id: 'saas-sales',
    name: 'SaaS sales',
    blurb: 'Monthly revenue and new customers by region and plan.',
    csv: `Month,Region,Plan,Revenue,New Customers,Churned
2024-01,North America,Pro,$142000,84,12
2024-01,North America,Enterprise,$318000,9,1
2024-01,Europe,Pro,$98000,61,9
2024-01,Europe,Enterprise,$204000,6,2
2024-01,Asia Pacific,Pro,$54000,47,7
2024-02,North America,Pro,$151000,91,10
2024-02,North America,Enterprise,$335000,11,2
2024-02,Europe,Pro,$104000,66,8
2024-02,Europe,Enterprise,$219000,7,1
2024-02,Asia Pacific,Pro,$61000,52,6
2024-03,North America,Pro,$163000,97,14
2024-03,North America,Enterprise,$361000,13,1
2024-03,Europe,Pro,$112000,71,7
2024-03,Europe,Enterprise,$233000,8,2
2024-03,Asia Pacific,Pro,$69000,58,5
2024-04,North America,Pro,$158000,88,16
2024-04,North America,Enterprise,$372000,12,3
2024-04,Europe,Pro,$121000,77,6
2024-04,Europe,Enterprise,$248000,9,1
2024-04,Asia Pacific,Pro,$76000,64,8`,
  },
]

export function getSample(id) {
  return SAMPLES.find((s) => s.id === id)
}
